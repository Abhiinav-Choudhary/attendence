import React, { useState, useRef, useEffect } from 'react';
import '../styles/dash.css';
import * as faceapi from 'face-api.js';
import axios from 'axios';

export default function Dashboard() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [details, setDetails] = useState({
    username: '',
    email: '',
    password: '',
    present: 0,
    absent: 0
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const openCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Failed to access camera: ' + err.message);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
  
    if (!video || !canvas) return;
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const imageUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageUrl);
  
    // Safely stop the stream
    const stream = video.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null; // Clear video source after stopping
    }
  
    setIsCameraOpen(false);
  
    if (uploadedImage) {
      compareFaces(uploadedImage, imageUrl);
    } else {
      alert("Please upload a photo first.");
    }
  };
  

  useEffect(() => {
    const loadModels = async () => {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
    };
    loadModels();
  }, []);

  const compareFaces = async (img1Src, img2Src) => {
    const img1 = await faceapi.fetchImage(img1Src);
    const img2 = await faceapi.fetchImage(img2Src);

    const detection1 = await faceapi
      .detectSingleFace(img1, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const detection2 = await faceapi
      .detectSingleFace(img2, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection1 && detection2) {
      const distance = faceapi.euclideanDistance(
        detection1.descriptor,
        detection2.descriptor
      );
      if (distance < 0.6) {
        setDetails(prev => ({
          ...prev,
          present: prev.present + 1
        }));
        alert('Attendance marked!');
      } else {
        alert('Face does not match. Try again.');
      }
    } else {
      alert('Face not detected in one of the images');
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setShowUpdatePanel(false);
  };

  const handleUpdateUser = () => {
    setShowUpdatePanel(true);
    setMenuOpen(false); // Optional: close menu when update panel opens
  };

  useEffect(() => {
    const fetchUser = async () => {
      const username = localStorage.getItem("username");
      try {
        const response = await axios.get(`http://localhost:7000/user/${ username}`);
        const userData = response.data;
  
        setDetails({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          present: userData.present || 0,
          absent: userData.absent || 0,
        });
  
      } catch (error) {
        console.error("Error fetching user:", error);
        alert("Failed to load user data");
      }
    };
  
    fetchUser();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const user = {
      username,
      email,
      password
    };
  
    const Newuser = {
      username :username ,
      email:email,
      password:password
    };
 console.log(Newuser);
 
    // Validation
    if (!user.username || !user.email || !user.password) {
      alert("Please fill in all required fields");
      return;
    }
  
    try {
      const username = localStorage.getItem("username");
      const response = await axios.put(`http://localhost:7000/user/${username}`, user);
  
      const userData = response.data;
     
      alert("Updation successful");
  
      setDetails({
        username: Newuser.username,
        email: Newuser.email,
        password: Newuser.password,
        present: Newuser.present || 0,
        absent: Newuser.absent || 0,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setShowUpdatePanel(false);
      
      // console.log(updatedUser);
  
     
    
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.error || "Request failed");
    }
  };
  

  return (
    <>
    <div className="dashboard-container">
      <h2 className="title">User Dashboard</h2>

      <div className="profile-section">
        <div className="image-box">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Profile" className="profile-img" />
          ) : (
            <div className="upload-placeholder">No Photo</div>
          )}
          <label className="upload-btn">
            {uploadedImage ? 'Change Photo' : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setUploadedImage(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              hidden
            />
          </label>
        </div>

        <div className="user-details">
          <p><strong>Name:</strong> {details.username}</p>
          <p><strong>Email:</strong> {details.email}</p>
          <p><strong>Password:</strong> {details.password}</p>
        </div>
      </div>

      <div className="attendance">
        <h3>Attendance</h3>
        <div className="attendance-info">
          <span className="present">Present: {details.present}</span>
          <span className="absent">Absent: {details.absent}</span>
        </div>

        <button className="attendance-btn" onClick={openCamera}>
          Mark Attendance
        </button>

        {isCameraOpen && (
          <div className="camera-container">
            <video ref={videoRef} autoPlay className="video-preview"></video>
            <button onClick={capturePhoto} className="capture-btn">Capture Photo</button>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
        )}
      </div>
   
     

    </div>

    <div className="hamburger-wrapper">
      <div className="hamburger" onClick={toggleMenu}>
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </div>

      {menuOpen && (
        <div className="menu">
          <button onClick={handleUpdateUser}>Update User</button>
        </div>
      )}

      {showUpdatePanel && (
        
        <div className="update-panel">
          <h3>Update User Details</h3>
          <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button>Update</button>
          </form>
        </div>
      )}
    </div>
</>
  );
}


