import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from "../api/attendanceApi";

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject(new Error("Location permission denied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

export default function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selfie, setSelfie] = useState("");
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");

  const { data, isLoading: recordsLoading, refetch } = useGetAttendanceQuery();
  const [punchIn, { isLoading: punchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();

  const todaysRecord = useMemo(() => {
    const list = data?.data || [];
    const today = new Date().toISOString().split("T")[0];
    return list.find((item) => {
      if (!item?.date) return false;
      return new Date(item.date).toISOString().split("T")[0] === today;
    });
  }, [data]);

  useEffect(() => {
    const stream = videoRef.current?.srcObject;
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setMessage("");
    } catch {
      setMessage("Camera access required for live selfie capture.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const sourceWidth = videoRef.current.videoWidth;
    const sourceHeight = videoRef.current.videoHeight;

    if (!sourceWidth || !sourceHeight) {
      setMessage("Wait for camera preview before capture.");
      return;
    }

    const maxWidth = 640;
    const ratio = Math.min(1, maxWidth / sourceWidth);
    const width = Math.round(sourceWidth * ratio);
    const height = Math.round(sourceHeight * ratio);

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);
    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.6);
    setSelfie(imageData);
    setMessage("Selfie captured successfully.");
  };

  const fetchLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      setMessage("Location captured.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitPunch = async (type) => {
    try {
      if (!selfie) {
        setMessage("Capture selfie first.");
        return;
      }
      if (!location) {
        setMessage("Capture location first.");
        return;
      }

      const payload = { ...location, selfie };
      if (type === "in") {
        await punchIn(payload).unwrap();
      } else {
        await punchOut(payload).unwrap();
      }

      await refetch();
      setMessage(`Punch ${type === "in" ? "In" : "Out"} successful.`);
      setSelfie("");
    } catch (error) {
      setMessage(
        error?.data?.message ||
          error?.error ||
          "Attendance action failed."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Live Attendance</h1>
        <p className="text-slate-500 mt-1">
          Capture live selfie and location to punch in/out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-semibold mb-4">Live Camera</h2>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-2xl bg-slate-100 aspect-video object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-wrap gap-3 mt-4">
            {!cameraOn ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-semibold"
              >
                Stop Camera
              </button>
            )}

            <button
              onClick={captureSelfie}
              disabled={!cameraOn}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold disabled:opacity-50"
            >
              Capture Selfie
            </button>
            <button
              onClick={fetchLocation}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
            >
              Capture Location
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-semibold mb-4">Punch Actions</h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {location ? `${location.lat}, ${location.lng}` : "Not captured"}
            </p>
            <p>
              <span className="font-semibold">Selfie:</span>{" "}
              {selfie ? "Captured" : "Not captured"}
            </p>
            {message && <p className="text-emerald-700 font-medium">{message}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => submitPunch("in")}
              disabled={punchingIn}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              {punchingIn ? "Punching In..." : "Punch In"}
            </button>
            <button
              onClick={() => submitPunch("out")}
              disabled={punchingOut}
              className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50"
            >
              {punchingOut ? "Punching Out..." : "Punch Out"}
            </button>
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-slate-600">
            <p className="font-semibold mb-2">Today Status</p>
            {todaysRecord ? (
              <>
                <p>Status: {todaysRecord.status || "Incomplete"}</p>
                <p>Working Hours: {todaysRecord.workingHours ?? 0}</p>
              </>
            ) : (
              <p>No attendance record for today yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-semibold mb-4">Recent Records</h2>
        {recordsLoading ? (
          <p className="text-slate-500">Loading records...</p>
        ) : (
          <div className="space-y-3">
            {(data?.data || []).slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="border border-slate-100 rounded-xl p-3 text-sm"
              >
                <p>Date: {new Date(item.date).toLocaleDateString()}</p>
                <p>Hours: {item.workingHours ?? 0}</p>
                <p>Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
