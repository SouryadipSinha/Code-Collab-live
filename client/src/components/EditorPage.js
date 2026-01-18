import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");

  const codeRef = useRef(null);
  const socketRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(err) {
        console.error(err);
        toast.error("Socket connection failed");
        navigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }
          setClients(clients);

          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied");
  };

  const leaveRoom = () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const res = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      setOutput(res.data.output || "No output");
    } catch (err) {
      setOutput(
        err.response?.data?.error ||
          err.message ||
          "Something went wrong while compiling"
      );
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen((prev) => !prev);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">

        {/* LEFT SIDEBAR */}
        <div
          className="col-md-2 d-flex flex-column"
          style={{
            backgroundColor: "#020617",
            borderRight: "1px solid #1e293b",
          }}
        >
          {/* LOGO */}
          <div className="text-center py-4">
            <img src="/images/codepp.png" alt="Logo" style={{ width: "120px" }} />
          </div>

          {/* MEMBERS */}
          <div className="px-3 flex-grow-1 overflow-auto">
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              MEMBERS
            </p>

            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          {/* BUTTONS */}
          <div className="p-3">
            <button
              className="btn w-100 mb-2"
              style={{
                backgroundColor: "#22c55e",
                color: "#020617",
                fontWeight: "600",
              }}
              onClick={copyRoomId}
            >
              Copy Room ID
            </button>

            <button
              className="btn w-100"
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontWeight: "600",
              }}
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="col-md-10 d-flex flex-column p-0">
          {/* TOP BAR */}
          <div
            className="p-2 d-flex justify-content-end"
            style={{
              backgroundColor: "#020617",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <select
              className="form-select w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>

      {/* COMPILER BUTTON */}
      <button
        className="btn position-fixed bottom-0 end-0 m-3"
        style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
        onClick={toggleCompileWindow}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* COMPILER WINDOW */}
      {isCompileWindowOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30vh",
            backgroundColor: "#020617",
            borderTop: "1px solid #1e293b",
            padding: "16px",
          }}
        >
          <div className="d-flex justify-content-between mb-2">
            <h6 style={{ color: "#e5e7eb" }}>
              Output ({selectedLanguage})
            </h6>

            <button
              className="btn btn-success btn-sm"
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Running..." : "Run"}
            </button>
          </div>

          <pre
            style={{
              backgroundColor: "#020617",
              color: "#e5e7eb",
              height: "100%",
              overflowY: "auto",
              border: "1px solid #1e293b",
              padding: "10px",
            }}
          >
            {output || "Output will appear here"}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
