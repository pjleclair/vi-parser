import "./notification.css"

const Notification = ({message, msgColor}) => {
    let notifColor
    let borderColor
    console.log(message)
    if (msgColor) {
        notifColor = msgColor;
        borderColor = msgColor;
    } else {
        notifColor = '#FFFFFF';
        borderColor = '#03DAC5'
    }
    return(
        <div style={{
            color: notifColor,
            borderColor: borderColor
        }} className="notification">{message}</div>
    )
}

export default Notification;