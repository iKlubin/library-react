import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Books from './components/Books/Books';
import BookDetail from './components/BookDetail/BookDetail';
import Profile from './components/Profile/Profile';
import Cart from './components/Cart/Cart';
import AddBook from './components/AddBook/AddBook';
import Search from './components/Search/Search';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import EditBook from './components/EditBook/EditBook';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/add-book" element={<AddBook />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
