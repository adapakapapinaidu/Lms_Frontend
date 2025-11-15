import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import MemberRow from "./MemberRow";
import AddMember from "./AddMember";

function MemberTable() {
  const [searchCategory, setSearchCategory] = useState("Name");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);

  const navigate = useNavigate();

  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const [isAddMember, setIsAddMember] = useState(false);
  const [memberList, setMemberList] = useState([]);

  const RenderTable = () => (
    <>
      {filteredMembers.map((member, index) => (
        <MemberRow
          key={member.id}
          member={member}
          place={index + 1}
          delete={(id) => {
            deleteRow(id);
          }}
          modify={member.id}
          save={(currentMember) => saveRow(currentMember)}
        />
      ))}
    </>
  );

  // 🔍 Filter members dynamically
  useEffect(() => {
  const filtered = memberList.filter((member) => {
    const { name, lastName, complaints } = member;

    const complaintValue = complaints?.toString().toLowerCase();
    const searchValue = searchTerm.toLowerCase();

    if (searchCategory === "Name") {
      return (
        name.toLowerCase().includes(searchValue) ||
        lastName.toLowerCase().includes(searchValue)
      );
    } else if (searchCategory === "Complaints") {
      // ✅ Works with both text and number complaints
      return complaintValue.includes(searchValue);
    } else if (searchCategory === "Complaints Bigger Than") {
      const complaintNum = parseFloat(complaints);
      const searchNum = parseFloat(searchTerm);
      return !isNaN(complaintNum) && !isNaN(searchNum) && complaintNum > searchNum;
    } else if (searchCategory === "Complaints Smaller Than") {
      const complaintNum = parseFloat(complaints);
      const searchNum = parseFloat(searchTerm);
      return !isNaN(complaintNum) && !isNaN(searchNum) && complaintNum < searchNum;
    }

    return true;
  });

  setFilteredMembers(filtered);
}, [memberList, searchCategory, searchTerm]);


  // ✅ Fixed version — removed incorrect body property
  async function addMember(data) {
    if (!data.name || !data.lastName) {
      return;
    }

    try {
      const requestData = {
        name: data.name,
        lastName: data.lastName,
        complaints: data.complaints,
      };

      console.log("Sending new member:", requestData); // Debug log

      const response = await axios.post("http://localhost:8080/members/add", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
        },
      });

      setIsAddMember(false);
      fetchMemberList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The member was added successfully!");
      } else {
        setIsSuccess("");
        setIsError("The member already exists! Please add another one.");
      }

      setTimeout(() => {
        setIsSuccess("");
        setIsError("");
      }, 3000);
    } catch (error) {
      console.error("Error while adding member:", error);
      setIsError("Failed to add member. Please check backend logs.");
    }
  }

  async function saveRow(data) {
    try {
      const requestData = {
        id: data.id,
        name: data.name,
        lastName: data.lastName,
        complaints: data.complaints,
      };

      const response = await axios.put("http://localhost:8080/members/edit", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
        },
      });

      fetchMemberList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The member was modified successfully!");
      } else {
        setIsSuccess("");
        setIsError("Couldn't update the member. Please try again.");
      }

      setTimeout(() => {
        setIsSuccess("");
        setIsError("");
      }, 3000);
    } catch (error) {
      console.error("Error while saving member:", error);
    }
  }

  async function deleteRow(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/members/remove/${id}`, {
        headers: { Authorization: sessionStorage.getItem("token") },
      });

      fetchMemberList();

      if (response.status === 200) {
        setIsError("");
        setIsSuccess("The member was deleted successfully!");
      } else {
        setIsSuccess("");
        setIsError("Couldn't delete the member. Please try again.");
      }

      setTimeout(() => {
        setIsSuccess("");
        setIsError("");
      }, 3000);
    } catch (error) {
      console.error("Error while deleting member:", error);
    }
  }

  function handleAddMember() {
    setIsAddMember(true);
  }

  function handleCancelAddMember() {
    setIsAddMember(false);
  }

  function handleBackButton() {
    navigate("/table");
  }

  async function fetchMemberList() {
    axios
      .get("http://localhost:8080/members/all", {
        headers: { Authorization: sessionStorage.getItem("token") },
      })
      .then((response) => {
        setMemberList([...response.data]);
      })
      .catch((error) => {
        console.error("Error while fetching members:", error);
      });
  }

  useEffect(() => {
    fetchMemberList();
  }, []);

  return (
    <>
      <div className="container">
        <h1>Member List</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
            <option value="Name">Search by Name</option>
            <option value="Complaints">Search by Complaints (Equal)</option>
            <option value="Complaints Bigger Than">Search by Complaints (Bigger Than)</option>
            <option value="Complaints Smaller Than">Search by Complaints (Smaller Than)</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Last Name</th>
              <th>Complaints</th>
              <th>Delete</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            <RenderTable />
            {isAddMember ? <AddMember onCancel={handleCancelAddMember} save={addMember} /> : null}
          </tbody>
        </table>

        <div className="button-container">
          <button className="button memberList" onClick={handleBackButton}>
            Back
          </button>
          <button className="button add_member" onClick={handleAddMember}>
            Add Member
          </button>
        </div>

        {isError && <p className="error">{isError}</p>}
        {isSuccess && <p className="success">{isSuccess}</p>}
      </div>
    </>
  );
}

export default MemberTable;
