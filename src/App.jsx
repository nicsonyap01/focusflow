import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import Login from "./Login";

import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Flame,
  History,
  LayoutDashboard,
  Moon,
  Sun,
  Users,
  User,
  MessageCircle,
  Copy,
  LogIn,
  Share2,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Target,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  Trash2,
  Plus,
  LogOut,
} from "lucide-react";

const SUBJECTS = [
  "Physics",
  "Mathematics",
  "Further Maths",
  "Chemistry",
  "Other",
];

const DURATIONS = [25, 50, 90];

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(
    seconds / 60
  );

  const secs = seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

function playCompletionSound() {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.frequency.value = 800;
    gain.gain.value = 0.07;

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 300);
  } catch {
    // Audio unavailable
  }
}

export default function App() {
  /* =====================================================
     AUTH
  ===================================================== */

  const [user, setUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);

          if (currentUser) {
            await setDoc(
              doc(
                db,
                "users",
                currentUser.uid
              ),
              {
                name:
                  currentUser.displayName ||
                  "",
                email:
                  currentUser.email ||
                  "",
                photoURL:
                  currentUser.photoURL ||
                  "",
                lastLogin:
                  serverTimestamp(),
              },
              {
                merge: true,
              }
            );
          }
        }
      );

    return unsubscribe;
  }, []);

  /* =====================================================
     PAGE
  ===================================================== */

  const [page, setPage] =
    useState("Dashboard");

  /* =====================================================
     THEME
  ===================================================== */

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("focusflow-theme") !== "light";
  });

  useEffect(() => {
    localStorage.setItem("focusflow-theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("focusflow-light", !darkMode);
  }, [darkMode]);

  /* =====================================================
     SOCIAL / PROFILE
  ===================================================== */

  const [studyRoom, setStudyRoom] = useState(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomName, setRoomName] = useState("Study Session");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);

  /* =====================================================
     THEME / PROFILE / STUDY TOGETHER
  ===================================================== */

  async function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid, "settings", "preferences"),
        { darkMode: next },
        { merge: true }
      );
    } catch (error) {
      console.error("Could not save theme:", error);
    }
  }

  useEffect(() => {
    if (!user) return;
    setProfileName(user.displayName || "");
    const profileRef = doc(db, "users", user.uid);
    return onSnapshot(profileRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (typeof data.name === "string") setProfileName(data.name);
      if (typeof data.bio === "string") setProfileBio(data.bio);
    });
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: profileName.trim() || user.displayName || "User",
          bio: profileBio.trim(),
          email: user.email || "",
          photoURL: user.photoURL || "",
        },
        { merge: true }
      );
      alert("Profile saved.");
    } catch (error) {
      console.error("Could not save profile:", error);
      alert("Could not save profile.");
    }
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  async function createStudyRoom() {
    if (!user) return;
    setSocialLoading(true);
    try {
      const code = generateRoomCode();
      const member = {
        uid: user.uid,
        name: profileName || user.displayName || "User",
        photoURL: user.photoURL || "",
      };
      const room = {
        code,
        name: roomName.trim() || "Study Session",
        hostId: user.uid,
        createdAt: serverTimestamp(),
        members: { [user.uid]: member },
      };
      await setDoc(doc(db, "studyRooms", code), room);
      setStudyRoom({ ...room, id: code });
      setRoomCodeInput(code);
    } catch (error) {
      console.error("Could not create study room:", error);
      alert("Could not create study room.");
    } finally {
      setSocialLoading(false);
    }
  }

  async function joinStudyRoom() {
    if (!user) return;
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 6) {
      alert("Enter a valid 6-character study code.");
      return;
    }
    setSocialLoading(true);
    try {
      const roomRef = doc(db, "studyRooms", code);
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) {
        alert("Study room not found.");
        return;
      }
      const data = snapshot.data();
      const member = {
        uid: user.uid,
        name: profileName || user.displayName || "User",
        photoURL: user.photoURL || "",
      };
      await updateDoc(roomRef, {
        [`members.${user.uid}`]: member,
      });
      setStudyRoom({ ...data, id: code, members: { ...(data.members || {}), [user.uid]: member } });
    } catch (error) {
      console.error("Could not join study room:", error);
      alert("Could not join study room.");
    } finally {
      setSocialLoading(false);
    }
  }

  function leaveStudyRoom() {
    setStudyRoom(null);
    setChatMessages([]);
  }

  async function sendChatMessage() {
    if (!user || !studyRoom || !chatText.trim()) return;
    try {
      await addDoc(
        collection(db, "studyRooms", studyRoom.id, "messages"),
        {
          uid: user.uid,
          name: profileName || user.displayName || "User",
          text: chatText.trim(),
          createdAt: serverTimestamp(),
        }
      );
      setChatText("");
    } catch (error) {
      console.error("Could not send message:", error);
      alert("Could not send message.");
    }
  }

  useEffect(() => {
    if (!studyRoom?.id) return;
    const roomRef = doc(db, "studyRooms", studyRoom.id);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setStudyRoom(null);
        return;
      }
      setStudyRoom({ ...snapshot.data(), id: snapshot.id });
    });
    const messagesRef = collection(db, "studyRooms", studyRoom.id, "messages");
    const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setChatMessages(data);
    });
    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [studyRoom?.id]);

  /* =====================================================
     TIMER
  ===================================================== */

  const [duration, setDuration] =
    useState(50);

  const [seconds, setSeconds] =
    useState(50 * 60);

  const [running, setRunning] =
    useState(false);

  const [subject, setSubject] =
    useState("Physics");

  /* =====================================================
     FIRESTORE DATA
  ===================================================== */

  const [tasks, setTasks] =
    useState([]);

  const [sessions, setSessions] =
    useState([]);

  const [dataLoading, setDataLoading] =
    useState(true);

  /* =====================================================
     SETTINGS
  ===================================================== */

  const [dailyGoal, setDailyGoal] =
    useState(4);

  const [sound, setSound] =
    useState(true);

  const [autoStart, setAutoStart] =
    useState(false);

  /* =====================================================
     TASK FORM
  ===================================================== */

  const [newTask, setNewTask] =
    useState("");

  const [taskSubject, setTaskSubject] =
    useState("Physics");

  /* =====================================================
     FIRESTORE LISTENERS
  ===================================================== */

  useEffect(() => {
    if (!user) return;

    setDataLoading(true);

    const tasksRef = collection(
      db,
      "users",
      user.uid,
      "tasks"
    );

    const sessionsRef =
      collection(
        db,
        "users",
        user.uid,
        "sessions"
      );

    const settingsRef = doc(
      db,
      "users",
      user.uid,
      "settings",
      "preferences"
    );

    const unsubscribeTasks =
      onSnapshot(
        tasksRef,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setTasks(data);
        },
        (error) => {
          console.error(
            "Tasks error:",
            error
          );
        }
      );

    const unsubscribeSessions =
      onSnapshot(
        sessionsRef,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          data.sort((a, b) => {
            const aTime =
              a.timestamp?.seconds ||
              0;

            const bTime =
              b.timestamp?.seconds ||
              0;

            return bTime - aTime;
          });

          setSessions(data);
          setDataLoading(false);
        },
        (error) => {
          console.error(
            "Sessions error:",
            error
          );

          setDataLoading(false);
        }
      );

    const unsubscribeSettings =
      onSnapshot(
        settingsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setDoc(
              settingsRef,
              {
                dailyGoal: 4,
                sound: true,
                autoStart: false,
                darkMode: true,
              },
              {
                merge: true,
              }
            );

            return;
          }

          const data =
            snapshot.data();

          if (
            typeof data.dailyGoal ===
            "number"
          ) {
            setDailyGoal(
              data.dailyGoal
            );
          }

          if (
            typeof data.sound ===
            "boolean"
          ) {
            setSound(data.sound);
          }

          if (
            typeof data.autoStart ===
            "boolean"
          ) {
            setAutoStart(
              data.autoStart
            );
          }
        },
        (error) => {
          console.error(
            "Settings error:",
            error
          );
        }
      );

    return () => {
      unsubscribeTasks();
      unsubscribeSessions();
      unsubscribeSettings();
    };
  }, [user]);

  /* =====================================================
     THEME / PROFILE / STUDY TOGETHER
  ===================================================== */

  async function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid, "settings", "preferences"),
        { darkMode: next },
        { merge: true }
      );
    } catch (error) {
      console.error("Could not save theme:", error);
    }
  }

  useEffect(() => {
    if (!user) return;
    setProfileName(user.displayName || "");
    const profileRef = doc(db, "users", user.uid);
    return onSnapshot(profileRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (typeof data.name === "string") setProfileName(data.name);
      if (typeof data.bio === "string") setProfileBio(data.bio);
    });
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: profileName.trim() || user.displayName || "User",
          bio: profileBio.trim(),
          email: user.email || "",
          photoURL: user.photoURL || "",
        },
        { merge: true }
      );
      alert("Profile saved.");
    } catch (error) {
      console.error("Could not save profile:", error);
      alert("Could not save profile.");
    }
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  async function createStudyRoom() {
    if (!user) return;
    setSocialLoading(true);
    try {
      const code = generateRoomCode();
      const member = {
        uid: user.uid,
        name: profileName || user.displayName || "User",
        photoURL: user.photoURL || "",
      };
      const room = {
        code,
        name: roomName.trim() || "Study Session",
        hostId: user.uid,
        createdAt: serverTimestamp(),
        members: { [user.uid]: member },
      };
      await setDoc(doc(db, "studyRooms", code), room);
      setStudyRoom({ ...room, id: code });
      setRoomCodeInput(code);
    } catch (error) {
      console.error("Could not create study room:", error);
      alert("Could not create study room.");
    } finally {
      setSocialLoading(false);
    }
  }

  async function joinStudyRoom() {
    if (!user) return;
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 6) {
      alert("Enter a valid 6-character study code.");
      return;
    }
    setSocialLoading(true);
    try {
      const roomRef = doc(db, "studyRooms", code);
      const snapshot = await getDoc(roomRef);
      if (!snapshot.exists()) {
        alert("Study room not found.");
        return;
      }
      const data = snapshot.data();
      const member = {
        uid: user.uid,
        name: profileName || user.displayName || "User",
        photoURL: user.photoURL || "",
      };
      await updateDoc(roomRef, {
        [`members.${user.uid}`]: member,
      });
      setStudyRoom({ ...data, id: code, members: { ...(data.members || {}), [user.uid]: member } });
    } catch (error) {
      console.error("Could not join study room:", error);
      alert("Could not join study room.");
    } finally {
      setSocialLoading(false);
    }
  }

  function leaveStudyRoom() {
    setStudyRoom(null);
    setChatMessages([]);
  }

  async function sendChatMessage() {
    if (!user || !studyRoom || !chatText.trim()) return;
    try {
      await addDoc(
        collection(db, "studyRooms", studyRoom.id, "messages"),
        {
          uid: user.uid,
          name: profileName || user.displayName || "User",
          text: chatText.trim(),
          createdAt: serverTimestamp(),
        }
      );
      setChatText("");
    } catch (error) {
      console.error("Could not send message:", error);
      alert("Could not send message.");
    }
  }

  useEffect(() => {
    if (!studyRoom?.id) return;
    const roomRef = doc(db, "studyRooms", studyRoom.id);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setStudyRoom(null);
        return;
      }
      setStudyRoom({ ...snapshot.data(), id: snapshot.id });
    });
    const messagesRef = collection(db, "studyRooms", studyRoom.id, "messages");
    const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setChatMessages(data);
    });
    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [studyRoom?.id]);

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (!running) return;

    const interval =
      setInterval(() => {
        setSeconds((current) => {
          if (current <= 1) {
            return 0;
          }

          return current - 1;
        });
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (
      seconds === 0 &&
      running
    ) {
      completeSession();
    }
  }, [seconds]);

  async function completeSession() {
    setRunning(false);

    if (!user) return;

    try {
      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "sessions"
        ),
        {
          subject,
          duration,
          dateKey: getTodayKey(),
          timestamp:
            serverTimestamp(),
        }
      );

      if (sound) {
        playCompletionSound();
      }

      if (autoStart) {
        setTimeout(() => {
          setSeconds(
            duration * 60
          );

          setRunning(true);
        }, 700);
      }
    } catch (error) {
      console.error(
        "Could not save session:",
        error
      );

      alert(
        "Your session could not be saved."
      );
    }
  }

  function toggleTimer() {
    if (seconds === 0) {
      setSeconds(
        duration * 60
      );
    }

    setRunning(
      (current) => !current
    );
  }

  function resetTimer() {
    setRunning(false);

    setSeconds(
      duration * 60
    );
  }

  function changeDuration(
    value
  ) {
    setRunning(false);

    setDuration(value);

    setSeconds(
      value * 60
    );
  }

  /* =====================================================
     TASKS
  ===================================================== */

  async function addTask() {
    if (!newTask.trim()) return;
    if (!user) return;

    try {
      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "tasks"
        ),
        {
          title:
            newTask.trim(),
          subject: taskSubject,
          minutes: 30,
          completed: false,
          createdAt:
            serverTimestamp(),
        }
      );

      setNewTask("");
    } catch (error) {
      console.error(
        "Could not add task:",
        error
      );

      alert(
        "Could not add task."
      );
    }
  }

  async function toggleTask(
    task
  ) {
    if (!user) return;

    try {
      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "tasks",
          task.id
        ),
        {
          completed:
            !task.completed,
        }
      );
    } catch (error) {
      console.error(
        "Could not update task:",
        error
      );
    }
  }

  async function deleteTask(
    id
  ) {
    if (!user) return;

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "tasks",
          id
        )
      );
    } catch (error) {
      console.error(
        "Could not delete task:",
        error
      );
    }
  }

  function startTask(task) {
    setSubject(
      task.subject
    );

    setDuration(
      task.minutes
    );

    setSeconds(
      task.minutes * 60
    );

    setPage("Focus Timer");

    setRunning(true);
  }

  /* =====================================================
     SETTINGS
  ===================================================== */

  async function updateSettings(
    updates
  ) {
    if (!user) return;

    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "settings",
          "preferences"
        ),
        updates,
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        "Could not update settings:",
        error
      );
    }
  }

  function updateGoal(value) {
    setDailyGoal(value);

    updateSettings({
      dailyGoal: value,
    });
  }

  function updateSound() {
    const next = !sound;

    setSound(next);

    updateSettings({
      sound: next,
    });
  }

  function updateAutoStart() {
    const next =
      !autoStart;

    setAutoStart(next);

    updateSettings({
      autoStart: next,
    });
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const today =
    getTodayKey();

  const todaySessions =
    useMemo(() => {
      return sessions.filter(
        (session) =>
          session.dateKey === today
      );
    }, [sessions, today]);

  const todayMinutes =
    todaySessions.reduce(
      (total, session) =>
        total +
        Number(
          session.duration || 0
        ),
      0
    );

  const todaySessionCount =
    todaySessions.length;

  const goalMinutes =
    dailyGoal * 60;

  const goalProgress =
    goalMinutes === 0
      ? 0
      : Math.min(
          Math.round(
            (todayMinutes /
              goalMinutes) *
              100
          ),
          100
        );

  const focusScore =
    goalProgress;

  /* =====================================================
     STREAK
  ===================================================== */

  const streak =
    useMemo(() => {
      const dateSet =
        new Set(
          sessions
            .map(
              (session) =>
                session.dateKey
            )
            .filter(Boolean)
        );

      let count = 0;

      const current =
        new Date();

      while (true) {
        const year =
          current.getFullYear();

        const month =
          String(
            current.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            current.getDate()
          ).padStart(2, "0");

        const key = `${year}-${month}-${day}`;

        if (!dateSet.has(key)) {
          break;
        }

        count++;

        current.setDate(
          current.getDate() - 1
        );
      }

      return count;
    }, [sessions]);

  /* =====================================================
     WEEKLY DATA
  ===================================================== */

  const weeklyData =
    useMemo(() => {
      const data = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setDate(
          date.getDate() - i
        );

        const year =
          date.getFullYear();

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            date.getDate()
          ).padStart(2, "0");

        const key =
          `${year}-${month}-${day}`;

        const minutes =
          sessions
            .filter(
              (session) =>
                session.dateKey === key
            )
            .reduce(
              (total, session) =>
                total +
                Number(
                  session.duration ||
                    0
                ),
              0
            );

        data.push({
          date: key,
          day: date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
          minutes,
        });
      }

      return data;
    }, [sessions]);

  const totalWeekMinutes =
    weeklyData.reduce(
      (total, item) =>
        total +
        item.minutes,
      0
    );

  const averageMinutes =
    Math.round(
      totalWeekMinutes / 7
    );

  const maxMinutes =
    Math.max(
      ...weeklyData.map(
        (item) =>
          item.minutes
      ),
      1
    );

  const completedTasks =
    tasks.filter(
      (task) =>
        task.completed
    ).length;

  const taskProgress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks /
            tasks.length) *
            100
        );

  /* =====================================================
     LOADING
  ===================================================== */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
            <Timer size={22} />
          </div>

          <p className="text-sm text-zinc-500">
            Loading FocusFlow...
          </p>

        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">

          <Timer
            size={28}
            className="mx-auto mb-4 animate-pulse"
          />

          <p className="text-sm text-zinc-500">
            Loading your study space...
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <>
      <style>{`
        .focusflow-light .bg\-\[\#09090b\] { background:#f6f7f9 !important; }
        .focusflow-light .bg\-\[\#0d0d0f\] { background:#ffffff !important; }
        .focusflow-light .bg\-\[\#111113\] { background:#ffffff !important; }
        .focusflow-light .bg-white\/\[0\.025\] { background:#f1f2f4 !important; }
        .focusflow-light .bg-white\/\[0\.03\] { background:#f5f6f8 !important; }
        .focusflow-light .bg-white\/\[0\.04\] { background:#f1f2f4 !important; }
        .focusflow-light .bg-white\/\[0\.05\] { background:#eef0f2 !important; }
        .focusflow-light .text-white { color:#18191c !important; }
        .focusflow-light .text-zinc-400 { color:#555a63 !important; }
        .focusflow-light .text-zinc-500 { color:#6b7079 !important; }
        .focusflow-light .text-zinc-600 { color:#8a8f98 !important; }
        .focusflow-light .text-zinc-700 { color:#a2a6ad !important; }
        .focusflow-light .border-white\/\[0\.07\] { border-color:#e1e4e8 !important; }
        .focusflow-light .border-white\/\[0\.08\] { border-color:#dfe2e6 !important; }
        .focusflow-light .border-white\/10 { border-color:#dfe2e6 !important; }
        .focusflow-light .bg-white\/\[0\.10\] { background:#dfe2e6 !important; }
        .focusflow-light .hover\:bg-white\/\[0\.05\]:hover { background:#eef0f2 !important; }
      `}</style>
      <div className="min-h-screen bg-[#09090b] text-white">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.07] bg-[#0d0d0f] p-5 md:flex md:flex-col">

          <div className="mb-10 flex items-center gap-3 px-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Timer size={20} />
            </div>

            <div>
              <div className="font-semibold">
                FocusFlow
              </div>

              <div className="text-xs text-zinc-600">
                Your study space
              </div>
            </div>

          </div>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Workspace
          </p>

          <nav className="space-y-1">

            <SidebarItem
              icon={
                <LayoutDashboard size={17} />
              }
              text="Dashboard"
              active={
                page === "Dashboard"
              }
              onClick={() =>
                setPage(
                  "Dashboard"
                )
              }
            />

            <SidebarItem
              icon={<Timer size={17} />}
              text="Focus Timer"
              active={
                page ===
                "Focus Timer"
              }
              onClick={() =>
                setPage(
                  "Focus Timer"
                )
              }
            />

            <SidebarItem
              icon={<Check size={17} />}
              text="Tasks"
              active={
                page === "Tasks"
              }
              onClick={() =>
                setPage("Tasks")
              }
            />

            <SidebarItem
              icon={
                <BarChart3 size={17} />
              }
              text="Statistics"
              active={
                page === "Statistics"
              }
              onClick={() =>
                setPage(
                  "Statistics"
                )
              }
            />

            <SidebarItem
              icon={
                <History size={17} />
              }
              text="History"
              active={
                page === "History"
              }
              onClick={() =>
                setPage("History")
              }
            />

          </nav>

          <SidebarItem
            icon={<Users size={17} />}
            text="Study Together"
            active={page === "Study Together"}
            onClick={() => setPage("Study Together")}
          />

          <SidebarItem
            icon={<User size={17} />}
            text="Profile"
            active={page === "Profile"}
            onClick={() => setPage("Profile")}
          />

          <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            More
          </p>

          <SidebarItem
            icon={
              <Settings size={17} />
            }
            text="Settings"
            active={
              page === "Settings"
            }
            onClick={() =>
              setPage("Settings")
            }
          />

          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

            <div className="flex items-center gap-2">

              <Flame
                size={16}
                className="text-orange-400"
              />

              <span className="text-sm font-medium">
                {streak} day streak
              </span>

            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Consistency beats
              intensity.
            </p>

          </div>

        </aside>

        {/* MAIN */}

        <main className="min-w-0 flex-1">

          <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 md:px-10">

            <div>

              <p className="text-xs text-zinc-600">
                FOCUSFLOW
              </p>

              <h1 className="mt-1 text-lg font-semibold">
                {page}
              </h1>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-medium">
                  {user.displayName ||
                    "User"}
                </p>

                <p className="text-xs text-zinc-600">
                  {user.email}
                </p>

              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-9 w-9 rounded-full border border-white/10"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                  {(
                    user.displayName ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

            </div>

          </header>

          <div className="mx-auto max-w-[1400px] p-5 pb-24 md:p-10">

            {page === "Dashboard" && (
              <Dashboard
                todayMinutes={
                  todayMinutes
                }
                dailyGoal={
                  dailyGoal
                }
                goalProgress={
                  goalProgress
                }
                focusScore={
                  focusScore
                }
                todaySessionCount={
                  todaySessionCount
                }
                streak={streak}
                tasks={tasks}
                onStart={() => {
                  setPage(
                    "Focus Timer"
                  );

                  setRunning(
                    true
                  );
                }}
                onTasks={() =>
                  setPage("Tasks")
                }
              />
            )}

            {page ===
              "Focus Timer" && (
              <TimerPage
                subject={subject}
                setSubject={
                  setSubject
                }
                duration={duration}
                seconds={seconds}
                running={running}
                onToggle={
                  toggleTimer
                }
                onReset={
                  resetTimer
                }
                onDuration={
                  changeDuration
                }
              />
            )}

            {page === "Tasks" && (
              <TasksPage
                tasks={tasks}
                newTask={newTask}
                setNewTask={
                  setNewTask
                }
                taskSubject={
                  taskSubject
                }
                setTaskSubject={
                  setTaskSubject
                }
                addTask={addTask}
                toggleTask={
                  toggleTask
                }
                deleteTask={
                  deleteTask
                }
                startTask={
                  startTask
                }
                taskProgress={
                  taskProgress
                }
              />
            )}

            {page ===
              "Statistics" && (
              <StatisticsPage
                todayMinutes={
                  todayMinutes
                }
                todaySessionCount={
                  todaySessionCount
                }
                focusScore={
                  focusScore
                }
                weeklyData={
                  weeklyData
                }
                totalWeekMinutes={
                  totalWeekMinutes
                }
                averageMinutes={
                  averageMinutes
                }
                maxMinutes={
                  maxMinutes
                }
              />
            )}

            {page === "History" && (
              <HistoryPage
                sessions={
                  sessions
                }
              />
            )}

            {page === "Study Together" && (
              <StudyTogetherPage
                user={user}
                studyRoom={studyRoom}
                roomName={roomName}
                setRoomName={setRoomName}
                roomCodeInput={roomCodeInput}
                setRoomCodeInput={setRoomCodeInput}
                createStudyRoom={createStudyRoom}
                joinStudyRoom={joinStudyRoom}
                socialLoading={socialLoading}
                chatMessages={chatMessages}
                chatText={chatText}
                setChatText={setChatText}
                sendChatMessage={sendChatMessage}
                leaveStudyRoom={leaveStudyRoom}
              />
            )}

            {page === "Profile" && (
              <ProfilePage
                user={user}
                profileName={profileName}
                setProfileName={setProfileName}
                profileBio={profileBio}
                setProfileBio={setProfileBio}
                saveProfile={saveProfile}
              />
            )}

            {page === "Settings" && (
              <SettingsPage
                dailyGoal={
                  dailyGoal
                }
                setDailyGoal={
                  updateGoal
                }
                sound={sound}
                toggleSound={
                  updateSound
                }
                autoStart={
                  autoStart
                }
                toggleAutoStart={
                  updateAutoStart
                }
                onLogout={
                  handleLogout
                }
                darkMode={darkMode}
                toggleDarkMode={toggleTheme}
              />
            )}

          </div>

        </main>

      </div>

      {/* MOBILE NAV */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#0d0d0f]/95 p-2 backdrop-blur md:hidden">

        <div className="grid grid-cols-5">

          <MobileNav
            icon={
              <LayoutDashboard
                size={18}
              />
            }
            text="Home"
            active={
              page ===
              "Dashboard"
            }
            onClick={() =>
              setPage(
                "Dashboard"
              )
            }
          />

          <MobileNav
            icon={
              <Timer size={18} />
            }
            text="Timer"
            active={
              page ===
              "Focus Timer"
            }
            onClick={() =>
              setPage(
                "Focus Timer"
              )
            }
          />

          <MobileNav
            icon={
              <Check size={18} />
            }
            text="Tasks"
            active={
              page === "Tasks"
            }
            onClick={() =>
              setPage("Tasks")
            }
          />

          <MobileNav
            icon={
              <BarChart3 size={18} />
            }
            text="Stats"
            active={
              page ===
              "Statistics"
            }
            onClick={() =>
              setPage(
                "Statistics"
              )
            }
          />

          <MobileNav
            icon={
              <Settings size={18} />
            }
            text="Settings"
            active={
              page === "Settings"
            }
            onClick={() =>
              setPage(
                "Settings"
              )
            }
          />

        </div>

      </div>

    </div>
    </>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  todayMinutes,
  dailyGoal,
  goalProgress,
  focusScore,
  todaySessionCount,
  streak,
  tasks,
  onStart,
  onTasks,
}) {
  /*
   * AUTOMATIC GREETING
   *
   * Before 12:00 PM  → Good morning
   * 12:00 PM–5:59 PM → Good afternoon
   * 6:00 PM onwards  → Good evening
   */

  const currentHour =
    new Date().getHours();

  let greeting;

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const incomplete =
    tasks.filter(
      (task) =>
        !task.completed
    );

  return (
    <>
      <div className="mb-8">

        <p className="text-sm text-zinc-500">
          {greeting} 👋
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          Ready to focus?
        </h2>

      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            <Clock3 size={17} />
          }
          label="Focus time"
          value={formatMinutes(
            todayMinutes
          )}
          description="today"
        />

        <StatCard
          icon={
            <Target size={17} />
          }
          label="Daily goal"
          value={`${goalProgress}%`}
          description={`${dailyGoal}h target`}
        />

        <StatCard
          icon={
            <Trophy size={17} />
          }
          label="Focus score"
          value={focusScore}
          description="out of 100"
        />

        <StatCard
          icon={
            <BookOpen size={17} />
          }
          label="Sessions"
          value={
            todaySessionCount
          }
          description="completed today"
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-8">

          <Zap
            size={22}
            className="mb-8 text-zinc-500"
          />

          <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
            NEXT SESSION
          </p>

          <h3 className="mt-3 text-3xl font-semibold">
            50 minute focus
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Put distractions away
            and complete one focused
            study session.
          </p>

          <button
            onClick={onStart}
            className="mt-8 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
          >
            <Play
              size={16}
              fill="currentColor"
            />

            Start focusing
          </button>

        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400/10">
              <Flame
                size={21}
                className="text-orange-400"
              />
            </div>

            <div>

              <p className="text-xs text-zinc-600">
                CURRENT STREAK
              </p>

              <p className="text-lg font-semibold">
                {streak} days
              </p>

            </div>

          </div>

          <div className="mt-8 grid grid-cols-7 gap-2">

            {Array.from({
              length: 28,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-md ${
                    index <
                    Math.min(
                      streak,
                      28
                    )
                      ? "bg-white/[0.18]"
                      : "bg-white/[0.05]"
                  }`}
                />
              )
            )}

          </div>

          <p className="mt-6 text-sm text-zinc-500">
            Consistency beats
            intensity.
          </p>

        </div>

      </div>

      <div className="mt-6 rounded-3xl border border-white/[0.07] bg-[#111113] p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
              TODAY
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              Upcoming tasks
            </h3>

          </div>

          <button
            onClick={onTasks}
            className="text-xs text-zinc-500 hover:text-white"
          >
            View all
          </button>

        </div>

        {incomplete.length ===
        0 ? (
          <div className="rounded-2xl bg-white/[0.025] p-6 text-center text-sm text-zinc-600">
            No outstanding tasks.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">

            {incomplete
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4"
                >

                  <p className="text-sm font-medium">
                    {task.title}
                  </p>

                  <p className="mt-2 text-[10px] text-zinc-600">
                    {task.subject} ·{" "}
                    {task.minutes} min
                  </p>

                </div>
              ))}

          </div>
        )}

      </div>
    </>
  );
}

/* =========================================================
   TIMER PAGE
========================================================= */

function TimerPage({
  subject,
  setSubject,
  duration,
  seconds,
  running,
  onToggle,
  onReset,
  onDuration,
}) {
  return (
    <div className="mx-auto max-w-4xl">

      <div className="mb-8 text-center">

        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
          FOCUS SESSION
        </p>

        <div className="relative mx-auto mt-4 inline-flex">

          <select
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            className="appearance-none bg-transparent pr-8 text-2xl font-semibold outline-none"
          >

            {SUBJECTS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-zinc-900"
                >
                  {item}
                </option>
              )
            )}

          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500"
          />

        </div>

      </div>

      <div className="rounded-[32px] border border-white/[0.07] bg-[#111113] p-8 md:p-16">

        <div className="flex flex-col items-center">

          <div className="relative flex h-[300px] w-[300px] items-center justify-center rounded-full border border-white/[0.08] md:h-[390px] md:w-[390px]">

            <div className="absolute inset-4 rounded-full border border-white/[0.04]" />

            <div className="text-center">

              <div className="text-[68px] font-light tracking-[-0.06em] md:text-[88px]">
                {formatTime(
                  seconds
                )}
              </div>

              <p className="mt-2 text-xs text-zinc-600">
                {running
                  ? "Focus mode active"
                  : "Ready when you are"}
              </p>

            </div>

          </div>

          <div className="mt-10 flex items-center gap-4">

            <button
              onClick={onReset}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] text-zinc-500 hover:text-white"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={onToggle}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-black hover:scale-105"
            >
              {running ? (
                <Pause
                  size={23}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={23}
                  fill="currentColor"
                />
              )}
            </button>

          </div>

          <div className="mt-9 flex gap-2">

            {DURATIONS.map(
              (value) => (
                <button
                  key={value}
                  onClick={() =>
                    onDuration(
                      value
                    )
                  }
                  className={`rounded-full px-5 py-2.5 text-xs ${
                    duration === value
                      ? "bg-white text-black"
                      : "border border-white/[0.08] text-zinc-500"
                  }`}
                >
                  {value} min
                </button>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TASKS PAGE
========================================================= */

function TasksPage({
  tasks,
  newTask,
  setNewTask,
  taskSubject,
  setTaskSubject,
  addTask,
  toggleTask,
  deleteTask,
  startTask,
  taskProgress,
}) {
  return (
    <>
      <div className="mb-8">

        <p className="text-sm text-zinc-500">
          Plan your study
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          Today's Tasks
        </h2>

      </div>

      <div className="mb-6 rounded-3xl border border-white/[0.07] bg-[#111113] p-6">

        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
          DAILY PROGRESS
        </p>

        <p className="mt-2 text-3xl font-semibold">
          {taskProgress}%
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">

          <div
            className="h-full rounded-full bg-white"
            style={{
              width: `${taskProgress}%`,
            }}
          />

        </div>

      </div>

      <div className="mb-6 rounded-3xl border border-white/[0.07] bg-[#111113] p-6">

        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-600">
          ADD TASK
        </p>

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            value={newTask}
            onChange={(e) =>
              setNewTask(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                addTask();
              }
            }}
            placeholder="What do you want to study?"
            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm outline-none placeholder:text-zinc-700"
          />

          <select
            value={taskSubject}
            onChange={(e) =>
              setTaskSubject(
                e.target.value
              )
            }
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm outline-none"
          >

            {SUBJECTS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-zinc-900"
                >
                  {item}
                </option>
              )
            )}

          </select>

          <button
            onClick={addTask}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
          >

            <Plus size={16} />

            Add task

          </button>

        </div>

      </div>

      <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-6">

        <div className="mb-6 flex items-center justify-between">

          <h3 className="text-xl font-semibold">
            {tasks.length} tasks
          </h3>

          <span className="text-xs text-zinc-600">
            {tasks.filter(
              (task) =>
                !task.completed
            ).length}{" "}
            remaining
          </span>

        </div>

        <div className="space-y-3">

          {tasks.map(
            (task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
              >

                <button
                  onClick={() =>
                    toggleTask(
                      task
                    )
                  }
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    task.completed
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-transparent"
                  }`}
                >

                  <Check size={13} />

                </button>

                <div className="min-w-0 flex-1">

                  <p
                    className={`text-sm font-medium ${
                      task.completed
                        ? "text-zinc-600 line-through"
                        : ""
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    {task.subject} ·{" "}
                    {task.minutes} min
                  </p>

                </div>

                {!task.completed && (
                  <button
                    onClick={() =>
                      startTask(
                        task
                      )
                    }
                    className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-zinc-400"
                  >
                    Start
                  </button>
                )}

                <button
                  onClick={() =>
                    deleteTask(
                      task.id
                    )
                  }
                  className="text-zinc-700 hover:text-red-400"
                >

                  <Trash2 size={15} />

                </button>

              </div>
            )
          )}

          {tasks.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-600">
              No tasks yet.
            </div>
          )}

        </div>

      </div>
    </>
  );
}

/* =========================================================
   STATISTICS
========================================================= */

function StatisticsPage({
  todayMinutes,
  todaySessionCount,
  focusScore,
  weeklyData,
  totalWeekMinutes,
  averageMinutes,
  maxMinutes,
}) {
  return (
    <>
      <div className="mb-8">

        <p className="text-sm text-zinc-500">
          Understand your study habits
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          Statistics
        </h2>

      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <StatCard
          icon={<Clock3 size={17} />}
          label="This week"
          value={formatMinutes(
            totalWeekMinutes
          )}
          description="focused"
        />

        <StatCard
          icon={
            <BarChart3 size={17} />
          }
          label="Daily average"
          value={`${averageMinutes}m`}
          description="per day"
        />

        <StatCard
          icon={<Trophy size={17} />}
          label="Best day"
          value={`${maxMinutes}m`}
          description="most focused"
        />

      </div>

      <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-7">

        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
          WEEKLY ACTIVITY
        </p>

        <h3 className="mt-2 text-xl font-semibold">
          Study time
        </h3>

        <div className="mt-10 flex h-64 items-end gap-3">

          {weeklyData.map(
            (item) => {

              const height =
                maxMinutes === 0
                  ? 0
                  : (item.minutes /
                      maxMinutes) *
                    100;

              return (
                <div
                  key={item.date}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >

                  <span className="text-[10px] text-zinc-600">
                    {item.minutes > 0
                      ? `${item.minutes}m`
                      : ""}
                  </span>

                  <div
                    className="w-full max-w-[45px] rounded-t-lg bg-white/[0.12]"
                    style={{
                      height:
                        item.minutes ===
                        0
                          ? "3px"
                          : `${height}%`,
                    }}
                  />

                  <span className="text-xs text-zinc-600">
                    {item.day}
                  </span>

                </div>
              );
            }
          )}

        </div>

      </div>

      <div className="mt-6 rounded-3xl border border-white/[0.07] bg-[#111113] p-7">

        <div className="text-center">

          <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
            TODAY'S FOCUS SCORE
          </p>

          <p className="mt-4 text-6xl font-semibold">
            {focusScore}
          </p>

          <p className="mt-2 text-sm text-zinc-600">
            {todaySessionCount} sessions ·{" "}
            {formatMinutes(
              todayMinutes
            )}
          </p>

        </div>

      </div>
    </>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryPage({
  sessions,
}) {
  return (
    <>
      <div className="mb-8">

        <p className="text-sm text-zinc-500">
          Every completed focus
          session
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          History
        </h2>

      </div>

      <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111113]">

        {sessions.length ===
        0 ? (
          <div className="p-16 text-center">

            <History
              size={32}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-4 text-sm text-zinc-600">
              Complete your first
              session to see it here.
            </p>

          </div>
        ) : (
          sessions.map(
            (session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border-b border-white/[0.04] px-6 py-5 last:border-0"
              >

                <div className="flex items-center gap-3">

               <button
                 onClick={toggleTheme}
                 title={darkMode ? "Switch to bright theme" : "Switch to dark theme"}
                 className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs text-zinc-400 hover:bg-white/[0.05]"
               >
                 {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                 <span className="hidden sm:inline">{darkMode ? "Bright" : "Dark"}</span>
               </button>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">

                    <BookOpen
                      size={16}
                      className="text-zinc-500"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      {session.subject}
                    </p>

                    <p className="text-xs text-zinc-600">
                      {session.dateKey}
                    </p>

                  </div>

                </div>

                <span className="text-sm text-zinc-500">
                  {session.duration} min
                </span>

              </div>
            )
          )
        )}

      </div>
    </>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  dailyGoal,
  setDailyGoal,
  sound,
  toggleSound,
  autoStart,
  toggleAutoStart,
  onLogout,
  darkMode,
  toggleDarkMode,
}) {
  return (
    <>
      <div className="mb-8">

        <p className="text-sm text-zinc-500">
          Customize your experience
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          Settings
        </h2>

      </div>

      <div className="max-w-3xl space-y-4">

        <SettingCard
          icon={
            <Target size={18} />
          }
          title="Daily study goal"
          description="How much focused study do you want to complete each day?"
        >

          <div className="flex gap-2">

            {[2, 4, 6, 8].map(
              (value) => (
                <button
                  key={value}
                  onClick={() =>
                    setDailyGoal(
                      value
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-sm ${
                    dailyGoal === value
                      ? "bg-white text-black"
                      : "border border-white/[0.08] text-zinc-500"
                  }`}
                >
                  {value}h
                </button>
              )
            )}

          </div>

        </SettingCard>

        <SettingCard
          icon={
            sound ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )
          }
          title="Completion sound"
          description="Play a sound when a focus session ends."
        >

          <Toggle
            enabled={sound}
            onClick={
              toggleSound
            }
          />

        </SettingCard>

        <SettingCard
          icon={<Zap size={18} />}
          title="Auto-start next session"
          description="Automatically begin another session after completion."
        >

          <Toggle
            enabled={autoStart}
            onClick={
              toggleAutoStart
            }
          />

        </SettingCard>

        <SettingCard
          icon={darkMode ? <Moon size={18} /> : <Sun size={18} />}
          title="Appearance"
          description="Switch between dark and bright themes."
        >

          <button
            onClick={toggleDarkMode}
            className={`relative h-7 w-12 rounded-full ${darkMode ? "bg-white" : "bg-zinc-300"}`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full transition-all ${darkMode ? "left-6 bg-black" : "left-1 bg-white"}`}
            />
          </button>

        </SettingCard>

        <SettingCard
          icon={<LogOut size={18} />}
          title="Account"
          description="Sign out of your FocusFlow account."
        >

          <button
            onClick={onLogout}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white"
          >
            Sign out
          </button>

        </SettingCard>

      </div>
    </>
  );
}

/* =========================================================
   STUDY TOGETHER
========================================================= */

function StudyTogetherPage({
  user,
  studyRoom,
  roomName,
  setRoomName,
  roomCodeInput,
  setRoomCodeInput,
  createStudyRoom,
  joinStudyRoom,
  socialLoading,
  chatMessages,
  chatText,
  setChatText,
  sendChatMessage,
  leaveStudyRoom,
}) {
  const members = Object.values(studyRoom?.members || {});

  async function copyCode() {
    if (!studyRoom?.code) return;
    try {
      await navigator.clipboard.writeText(studyRoom.code);
      alert("Study code copied.");
    } catch {
      alert(`Study code: ${studyRoom.code}`);
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Study with others</p>
        <h2 className="mt-1 text-3xl font-semibold">Study Together</h2>
      </div>

      {!studyRoom ? (
        <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-semibold">Create a study room</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Generate a private code and invite your friends to study together.
            </p>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className="mt-6 w-full rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-600"
            />
            <button
              onClick={createStudyRoom}
              disabled={socialLoading}
              className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50"
            >
              {socialLoading ? "Creating..." : "Create room"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300">
              <LogIn size={20} />
            </div>
            <h3 className="text-xl font-semibold">Join a room</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Enter the 6-character code shared by your study partner.
            </p>
            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="mt-6 w-full rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] outline-none placeholder:text-zinc-700"
            />
            <button
              onClick={joinStudyRoom}
              disabled={socialLoading}
              className="mt-3 w-full rounded-xl border border-white/[0.1] px-4 py-3 text-sm font-medium hover:bg-white/[0.05] disabled:opacity-50"
            >
              {socialLoading ? "Joining..." : "Join room"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid max-w-6xl gap-5 lg:grid-cols-[280px_1fr]">
          <div className="rounded-3xl border border-white/[0.07] bg-[#111113] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">ROOM</p>
            <h3 className="mt-2 text-xl font-semibold">{studyRoom.name}</h3>
            <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-center">
              <p className="text-xs text-zinc-600">STUDY CODE</p>
              <p className="mt-2 text-2xl font-bold tracking-[0.25em]">{studyRoom.code}</p>
              <button onClick={copyCode} className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
                <Copy size={13} /> Copy code
              </button>
            </div>
            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-600">STUDYING NOW</p>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.uid} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                        {(member.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-sm">{member.name || "User"}</span>
                    {member.uid === studyRoom.hostId && <span className="ml-auto text-[9px] text-zinc-600">HOST</span>}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={leaveStudyRoom} className="mt-6 w-full rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/[0.05]">
              Leave room
            </button>
          </div>

          <div className="flex min-h-[560px] flex-col rounded-3xl border border-white/[0.07] bg-[#111113]">
            <div className="border-b border-white/[0.07] p-5">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <h3 className="font-semibold">Room chat</h3>
              </div>
              <p className="mt-1 text-xs text-zinc-600">Talk while you study.</p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {chatMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-zinc-600">Start the conversation.</div>
              ) : chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.uid === user?.uid ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.uid === user?.uid ? "bg-white text-black" : "bg-white/[0.05]"}`}>
                    <p className="mb-1 text-[10px] font-medium opacity-60">{message.name}</p>
                    <p className="text-sm leading-5">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}
              className="flex gap-2 border-t border-white/[0.07] p-4"
            >
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type a message..."
                className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-600"
              />
              <button type="submit" className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black">Send</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfilePage({ user, profileName, setProfileName, profileBio, setProfileBio, saveProfile }) {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-zinc-500">Your public study profile</p>
        <h2 className="mt-1 text-3xl font-semibold">Profile</h2>
      </div>

      <div className="max-w-2xl rounded-3xl border border-white/[0.07] bg-[#111113] p-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full border border-white/10" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-semibold text-black">
              {(profileName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">{profileName || "Your name"}</p>
            <p className="text-sm text-zinc-600">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Display name</label>
            <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Study bio</label>
            <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} rows={4} placeholder="Tell other students what you are studying..." className="w-full resize-none rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-700" />
          </div>
          <button onClick={saveProfile} className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black">Save profile</button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SidebarItem({
  icon,
  text,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
        active
          ? "bg-white text-black"
          : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}

function MobileNav({
  icon,
  text,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${
        active
          ? "text-white"
          : "text-zinc-600"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">

      <div className="mb-4 flex items-center gap-2 text-zinc-600">

        {icon}

        <span className="text-xs">
          {label}
        </span>

      </div>

      <div className="text-2xl font-semibold">
        {value}
      </div>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  );
}

function SettingCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-[#111113] p-6 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-400">
          {icon}
        </div>

        <div>

          <h3 className="text-sm font-medium">
            {title}
          </h3>

          <p className="mt-1 max-w-lg text-xs leading-5 text-zinc-600">
            {description}
          </p>

        </div>

      </div>

      {children}

    </div>
  );
}

function Toggle({
  enabled,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full ${
        enabled
          ? "bg-white"
          : "bg-white/[0.10]"
      }`}
    >

      <span
        className={`absolute top-1 h-5 w-5 rounded-full ${
          enabled
            ? "left-6 bg-black"
            : "left-1 bg-zinc-500"
        }`}
      />

    </button>
  );
}