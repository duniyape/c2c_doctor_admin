import { Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import Home from './components/Deshboard';
import { LoaderProvider } from './loader/LoaderContext';
import { UserProvider } from './context/UserContext';
import { WhatsappAppointList } from './pages/newupdate/WhatsappAppointList';


function App() {
  return (
    <Router>
       
      <LoaderProvider>
      <UserProvider>
        <Home />
      </UserProvider>
      </LoaderProvider>
    </Router>
  );
}

export default App;
