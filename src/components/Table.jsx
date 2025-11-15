import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableRow from "./TableRow";
import AddBook from "./AddBook";
import axios from "axios";

function Table(props) {
  const navigate = useNavigate();

  const [bookList, setBookList] = useState([]);
  const [isAddBook, setIsAddBook] = useState(false);

  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("Title");

  const API_URL = process.env.REACT_APP_API_URL;

  const filteredBooks = bookList.filter((book) => {
    if (searchCategory === "Member ID") {
      if (searchTerm.toLowerCase() === "") {
        return !book.memberObject || !book.memberObject.id;
      } else {
        return book.memberObject && book.memberObject.id && book.memberObject.id.toString().includes(searchTerm.toLowerCase());
      }
    } else {
      return book[searchCategory.toLowerCase()].toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const RenderTable = () => (
    <>
      {filteredBooks.map((book, index) => (
        <TableRow
          key={book.id}
          book={book}
          place={index + 1}
          delete={(id) => deleteRow(id)}
          modify={book.id}
          save={(currentBook) => saveRow(currentBook)}
        />
      ))}
    </>
  );

  function handleSearch(event) {
    setSearchTerm(event.target.value);
  }

  function handleSearchCategory(event) {
    setSearchCategory(event.target.value);
  }

  async function addBook(data) {
    if (!data.title || !data.genre || !data.author || !data.isbn) return;

    try {
      const requestData = { title: data.title, genre: data.genre, author: data.author, isbn: data.isbn };
      if (data.memberId) requestData.memberObject = { id: data.memberId };

      const response = await axios.post(`${API_URL}/books/add`, requestData, {
        headers: { "Content-Type": "application/json", Authorization: sessionStorage.getItem("token") },
      });

      setIsAddBook(false);
      fetchBookList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The book was added successfully");
      } else {
        setIsSuccess("");
        setIsError("The book already exists! Please add another one.");
      }

      setTimeout(() => { setIsSuccess(""); setIsError(""); }, 3000);
    } catch (error) {
      console.error(error);
      setIsError("Failed to add book. Check backend logs.");
    }
  }

  async function saveRow(data) {
    try {
      const requestData = { id: data.id, title: data.title, genre: data.genre, author: data.author, isbn: data.isbn };
      if (data.memberId) requestData.memberObject = { id: data.memberId };

      const response = await axios.put(`${API_URL}/books/edit`, requestData, {
        headers: { "Content-Type": "application/json", Authorization: sessionStorage.getItem("token") },
      });

      fetchBookList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The book was modified successfully");
      } else {
        setIsSuccess("");
        setIsError("Couldn't update the book. Please try again.");
      }

      setTimeout(() => { setIsSuccess(""); setIsError(""); }, 3000);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteRow(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await axios.delete(`${API_URL}/books/remove/${id}`, {
        headers: { Authorization: sessionStorage.getItem("token") },
      });

      fetchBookList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The book was deleted successfully");
      } else {
        setIsSuccess("");
        setIsError("Couldn't delete the book. Please try again.");
      }

      setTimeout(() => { setIsSuccess(""); setIsError(""); }, 3000);
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    navigate("/");
  }

  function handleMemberTable() {
    navigate("/members");
  }

  async function fetchBookList() {
    try {
      const response = await axios.get(`${API_URL}/books/all`, {
        headers: { Authorization: sessionStorage.getItem("token") },
      });
      setBookList([...response.data]);
    } catch (error) {
      console.error(error);
    }
  }

  function handleAddBook() { setIsAddBook(true); }
  function handleCancelAddBook() { setIsAddBook(false); }

  useEffect(() => { fetchBookList(); }, []);

  return (
    <div className="container">
      <h1>Book List</h1>

      <div className="search-container">
        <input type="text" placeholder="Search by..." value={searchTerm} onChange={handleSearch} />
        <select value={searchCategory} onChange={handleSearchCategory}>
          <option value="Title">Title</option>
          <option value="Genre">Genre</option>
          <option value="Author">Author</option>
          <option value="ISBN">ISBN</option>
          <option value="Member ID">Member ID</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Genre</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Member ID</th>
            <th>Delete</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <RenderTable />
          {isAddBook && <AddBook onCancel={handleCancelAddBook} save={addBook} />}
        </tbody>
      </table>

      <div className="button-container">
        <button className="button logout" onClick={handleLogout}>Logout</button>
        <button className="button add_book" onClick={handleAddBook}>Add Book</button>
        <button className="button memberList" onClick={handleMemberTable}>Member List</button>
      </div>

      {isError && <p className="error">{isError}</p>}
      {isSuccess && <p className="success">{isSuccess}</p>}
    </div>
  );
}

export default Table;
