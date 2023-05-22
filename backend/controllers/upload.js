const uploadRouter = require('express').Router();

const axios = require('axios');
const XLSX = require('xlsx');
const Mailjet = require('node-mailjet');

//OpenAI Configuration
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY}`,
}
const apiUrl="https://api.openai.com/v1/completions";

//Twilio Configuration
const accountSid = process.env.ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//Mailjet Configuration
const mailjet = Mailjet.apiConnect(
    process.env.MJ_API_PUB_KEY || 'your-api-key',
    process.env.MJ_API_PRIV_KEY || 'your-api-secret',
    {
        config: {},
        options: {}
    }
);
  
uploadRouter.post('/', (req, res) => {
    if (!req.files || !req.files.file || !req.body.configuration) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const file = req.files.file;
    const configuration = JSON.parse(req.body.configuration);
    const campaignDesc = req.body.campaignDesc;
    const orgName = req.body.orgName;
    const narrative = req.body.narrative;
    const donateLink = req.body.donateLink;
    const deliveryMethod = req.body.deliveryMethod;

    // Read the uploaded file
    const workbook = XLSX.read(file.data, { type: 'buffer' });

    // Assume the first sheet is the one we're interested in
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    //console.log(jsonData); // Log the converted JSON data to the console

    // Combine the file data with the configuration
    const combinedData = jsonData.map((row) => {
        const combinedRow = {};

        try {
        Object.entries(configuration.columnMappings).forEach(([index, mappedColumnName]) => {
            const columnIndex = parseInt(index, 10);
            const columnName = Object.keys(row)[columnIndex];

            if (columnName !== undefined && row[columnName] !== undefined) {
            combinedRow[mappedColumnName] = row[columnName];
            }
        });
        } catch (error) {
        console.error('Error in Row:', row);
        throw error;
        }

        return combinedRow;
    });

    //make API call to OpenAI
    let msgArray = [];
    const promises = Array.from(combinedData, (obj, index) => {
        console.log(obj)
        const data={
        "model": "text-davinci-003",
        "prompt": `Create a fundraising text message addressed to ${obj.fullName} for a ${campaignDesc} campaign named "${orgName}" based on ${narrative} that targets US citizens of age ${obj.age} that are members of the ${obj.party} political party - be sure to include a shortened hyperlink to donate at ${donateLink} and address the recipient by first name, but do not explicitly mention age or political party, just use those parameters to tailor your content.`,
        "max_tokens": 240,
        "temperature": 0.5
        }

        return axios
        .post(apiUrl, data, { headers })
        .then((response) => {
        // Handle the response
        console.log(response.data.choices[0].text);
        return response.data.choices[0].text;
        })
        .catch((error) => {
        // Handle errors
        return error;
        });
    });

    Promise.all(promises)
    .then((msgArray) => {
        // Iterate through the array of GPT-tailored messages
        msgArray.map((msg, index) => {
        const name = combinedData[index].fullName;
        if(deliveryMethod === 'email')
            {
            const email = combinedData[index].emailAddress;
            if(email === undefined) {
                console.log('no email! delivery aborted')
            } else {
                const request = mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                    {
                        From: {
                        Email: "pleclair@protonmail.com",
                        Name: "Phillip LeClair"
                        },
                        To: [
                        {
                            Email: email,
                            Name: name
                        }
                        ],
                        Subject: "HELLO WORLD",
                        TextPart: "Dear Chum, welcome to Mailjet! May the delivery force be with you!",
                        HTMLPart: "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
                    }
                    ]
                })

            request
            .then((result) => {
                console.log(result.body)
            })
            .catch((err) => {
                console.log(err.statusCode)
            })
            }
        } else if (deliveryMethod === 'text') {
            const num = combinedData[index].phoneNumber.replace(/-/g,'');
            if(num === undefined) {
            console.log('no number! delivery aborted')
            } else {
            client.messages
            .create({ body: msg, from: "+18885459281", to: `+1${num}` })
            .then(message => console.log(message.sid));
            }
        }
        });

        res.json({ data: combinedData, message: "File upload successful", gpt: msgArray});
    })
    .catch((error) => {
        // Handle errors in promise.all
        console.error(error);
    });
});

module.exports = uploadRouter;