import { useState } from "react";
import axios from "axios";

function AddMember({ onCancel, save }) {
  const [newMember, setNewMember] = useState({
    name: "",
    lastName: "",
    complaints: "",
  });

  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  function handleChange(event) {
    const { name, value } = event.target;
    setNewMember((prevMember) => ({
      ...prevMember,
      [name]: value || "", // ensure it's not null
    }));
  }

  async function handleSave() {
    // Validation
    if (!newMember.name.trim() || !newMember.lastName.trim()) {
      setIsError("First name and last name are required.");
      setTimeout(() => setIsError(""), 3000);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setIsError("You must be logged in to add a member.");
      setTimeout(() => setIsError(""), 3000);
      return;
    }

    try {
      const requestData = {
        name: newMember.name.trim(),
        lastName: newMember.lastName.trim(),
        complaints: newMember.complaints.trim(),
      };

      const response = await axios.post(`${API_URL}/members/add`, requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setIsSuccess("Member added successfully!");
        save(newMember); // update parent state
        setNewMember({ name: "", lastName: "", complaints: "" });
        setTimeout(() => setIsSuccess(""), 3000);
      } else {
        setIsError("Failed to add member. Member may already exist.");
        setTimeout(() => setIsError(""), 3000);
      }
    } catch (error) {
      console.error("Error while adding member:", error);
      setIsError(error.response?.data?.message || "Failed to add member. Check backend logs.");
      setTimeout(() => setIsError(""), 3000);
    }
  }

  return (
    <tr>
      <td>
        <p>Name</p>
      </td>
      <td>
        <input
          type="text"
          name="name"
          value={newMember.name}
          onChange={handleChange}
          placeholder="Enter first name"
        />
      </td>
      <td>
        <input
          type="text"
          name="lastName"
          value={newMember.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
        />
      </td>
      <td>
        <input
          type="text"
          name="complaints"
          value={newMember.complaints}
          onChange={handleChange}
          placeholder="Enter complaints"
        />
      </td>
      <td>
        <button className="button dlt" onClick={onCancel}>
          Cancel
        </button>
      </td>
      <td>
        <button className="button edit" onClick={handleSave}>
          Save
        </button>
      </td>
      <td colSpan={2}>
        {isError && <p className="error">{isError}</p>}
        {isSuccess && <p className="success">{isSuccess}</p>}
      </td>
    </tr>
  );
}

export default AddMember;
