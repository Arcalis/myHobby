import { Link } from 'react-router-dom'
import logo from '/src/assets/logo.png'
function Navbar() {
    return (
        <>
            <img src={logo} alt="Логотип" />
            <h1>ОБРАЗОВАТЕЛЬНЫЕ ПЛАТФОРМЫ</h1>

            <Link to=".src/App.jsx">Главная</Link>
            <Link to=".src/pages/Events">Мероприятия</Link>
            <Link to=".src/pages/aboutUs">О нас</Link>

            <button name="SignIn" value="signIn">Войти</button>
        </>
    )
}

export default Navbar