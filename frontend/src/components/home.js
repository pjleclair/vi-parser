import './home.css'

const Home = ({userName}) => {
    return(
        <div className='home'>
            <h3>Welcome <span>{userName}</span>!</h3>
            <br />
            <h2>Analytics Dashboard</h2>
            <p>There are no analytics to display at this time. Please check back later.</p>
        </div>
    )
}

export default Home;