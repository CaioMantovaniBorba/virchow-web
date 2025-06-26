import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}

export default App;