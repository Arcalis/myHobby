import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <Link to="/">Список мероприятий</Link>
      <Link to="/map">Карта</Link>
      <Link to="/profile">Личный кабинет</Link>
    </nav>
  )
}

export default Navbar