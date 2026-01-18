import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("New Room ID generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID and Username are required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6 col-lg-4">
          
          {/* MAIN BOX */}
          <div
            className="card p-4"
            style={{
              backgroundColor: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "12px",
            }}
          >
            {/* LOGO */}
            <div className="text-center mb-4">
              <img
                src="/images/codepp.png"
                alt="Logo"
                style={{
                  width: "120px",
                  filter: "brightness(1.2)",
                }}
              />
            </div>

            <h4 className="text-center mb-4" style={{ color: "#e5e7eb" }}>
              Enter the ROOM ID
            </h4>

            {/* ROOM ID */}
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
              placeholder="ROOM ID"
              className="form-control mb-3"
              style={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                color: "#e5e7eb",
              }}
            />

            {/* USERNAME */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleInputEnter}
              placeholder="USERNAME"
              className="form-control mb-4"
              style={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                color: "#e5e7eb",
              }}
            />

            {/* JOIN BUTTON */}
            <button
              onClick={joinRoom}
              className="btn w-100 mb-3"
              style={{
                backgroundColor: "#22c55e",
                color: "#020617",
                fontWeight: "600",
              }}
            >
              JOIN
            </button>

            {/* CREATE ROOM */}
            <p className="text-center" style={{ color: "#94a3b8" }}>
              Don't have a room ID?{" "}
              <span
                onClick={generateRoomId}
                style={{
                  color: "#22c55e",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Create New Room
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;
