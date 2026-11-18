import { useState, useEffect } from "react";
import { getDatabase, push, ref, set, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import { FaEdit, FaHeart, FaRegHeart, FaImage, FaSmile } from "react-icons/fa";
import { MdDelete, MdCancel } from "react-icons/md";

const App = () => {
  let [userName, setUserName] = useState("");
  let [inputValue, setInputValue] = useState("");
  let [imageUrl, setImageUrl] = useState("");
  let [showEmoji, setShowEmoji] = useState(false);
  let [todos, setTodos] = useState([]);
  let [loading, setLoading] = useState(false);

  let [isEdit, setIsEdit] = useState(false);
  let [editId, setEditId] = useState("");

  const db = getDatabase();

  // Expanded emoji collection
  const emojis = [
    "🔥", "🚀", "💡", "⚡", "✨", "🎯", "💻", "💎", "⭐",
    "😊", "😂", "❤️", "👍", "🙌", "😎", "🎉", "🔥", "💯",
    "😍", "👏", "✨", "🙏", "💻", "🔥", "🚀", "🌟", "💬"
  ];

  let handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  let handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji);
    setShowEmoji(false);
  };

  let handleLike = (item) => {
    let currentLikes = item.likes || 0;
    let isLiked = item.isLiked || false;

    update(ref(db, "todos/" + item.id), {
      likes: isLiked ? currentLikes - 1 : currentLikes + 1,
      isLiked: !isLiked,
    });
  };

  let handleTodo = () => {
    if (userName === "" || inputValue === "") {
      toast.warn("Please enter your name and message!");
      return;
    }

    setLoading(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isEdit) {
      update(ref(db, "todos/" + editId), {
        name: userName,
        input: inputValue,
        image: imageUrl,
      })
        .then(() => {
          toast.success("Post updated successfully!");
          setLoading(false);
          setUserName("");
          setInputValue("");
          setImageUrl("");
          setIsEdit(false);
          setEditId("");
        })
        .catch((error) => {
          toast.error("Update failed, error: " + error);
          setLoading(false);
        });
    } else {
      set(push(ref(db, "todos/")), {
        name: userName,
        input: inputValue,
        image: imageUrl,
        date: formattedDate,
        time: formattedTime,
        likes: 0,
        isLiked: false,
      })
        .then(() => {
          toast.success("Post published successfully!");
          setLoading(false);
          setUserName("");
          setInputValue("");
          setImageUrl("");
        })
        .catch((error) => {
          toast.error("Unsuccessful, error: " + error);
          setLoading(false);
        });
    }
  };

  let handleDelete = (id) => {
    remove(ref(db, "todos/" + id))
      .then(() => {
        toast.info("Post deleted successfully");
      })
      .catch((error) => {
        toast.error("Delete failed: " + error);
      });
  };

  let handleEdit = (item) => {
    setUserName(item.name || "");
    setInputValue(item.input);
    setImageUrl(item.image || "");
    setIsEdit(true);
    setEditId(item.id);
  };

  useEffect(() => {
    const todosRef = ref(db, "todos/");
    onValue(todosRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push({ ...item.val(), id: item.key });
      });
      setTodos(arr.reverse());
    });
  }, [db]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 py-12 px-4 flex flex-col items-center font-sans selection:bg-indigo-500 selection:text-white">
      {/* Modern Header */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-8 text-center">
       To Do App
      </h1>

      {/* Input Container Box */}
      <div className="w-full max-w-[520px] bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-indigo-950/40 rounded-2xl p-6 flex flex-col gap-4">
        {/* Name Input */}
        <input
          className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 font-medium transition text-sm"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          type="text"
          placeholder="Enter your name..."
        />

        {/* Message Textarea */}
        <textarea
          rows="3"
          className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 transition resize-none text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What's on your mind today? Share your thoughts..."
        />

        {/* Image Preview with object-contain */}
        {imageUrl && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 bg-slate-900/80 text-slate-300 hover:text-white rounded-full p-1.5 transition cursor-pointer"
              title="Remove Image"
            >
              <MdCancel size={20} />
            </button>
          </div>
        )}

        {/* Toolbar & Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 relative">
          <div className="flex items-center gap-3">
            {/* Photo Attachment */}
            <label
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-medium transition"
              title="Attach Photo"
            >
              <FaImage className="text-base text-indigo-400" />
              <span>Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Emoji Trigger */}
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-medium transition"
              title="Add Emoji"
            >
              <FaSmile className="text-base text-amber-400" />
              <span>Emoji</span>
            </button>
          </div>

          {/* Extended Emoji Popup Box with scrollable grid */}
          {showEmoji && (
            <div className="absolute bottom-14 left-0 bg-slate-900 border border-slate-800 shadow-2xl rounded-xl p-3 grid grid-cols-6 gap-2 z-20 max-w-[280px] max-h-48 overflow-y-auto">
              {emojis.map((em, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(em)}
                  className="text-xl hover:scale-125 transition cursor-pointer p-1 flex items-center justify-center bg-slate-800/40 rounded-lg hover:bg-slate-800"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition flex items-center justify-center min-w-[110px]"
            onClick={handleTodo}
          >
            {loading ? (
              <Bars height="20" width="35" color="#ffffff" ariaLabel="bars-loading" />
            ) : isEdit ? (
              "Update"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <ul className="w-full max-w-[520px] flex flex-col gap-4 mt-6">
        {todos.map((item) => (
          <li
            key={item.id}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col gap-3 transition hover:border-slate-700"
          >
            {/* Post Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                  {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm leading-tight">
                    {item.name || "Anonymous"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.date} at {item.time}
                  </p>
                </div>
              </div>

              {/* Edit & Delete Actions */}
              <div className="flex gap-3 text-base text-slate-400">
                <FaEdit
                  onClick={() => handleEdit(item)}
                  className="cursor-pointer hover:text-indigo-400 transition"
                  title="Edit Post"
                />
                <MdDelete
                  onClick={() => handleDelete(item.id)}
                  className="cursor-pointer hover:text-rose-400 transition"
                  title="Delete Post"
                />
              </div>
            </div>

            {/* Post Message */}
            <p className="text-slate-300 text-sm leading-relaxed px-0.5 font-normal break-words">
              {item.input}
            </p>

            {/* Attached Image with object-contain to prevent any cropping */}
            {item.image && (
              <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2 mt-1">
                <img
                  src={item.image}
                  alt="Attachment"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Post Footer / Like Section */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <button
                onClick={() => handleLike(item)}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 cursor-pointer transition group"
              >
                {item.isLiked ? (
                  <FaHeart className="text-rose-500 text-base" />
                ) : (
                  <FaRegHeart className="text-slate-500 group-hover:text-rose-400 text-base transition" />
                )}
                <span>
                  {item.likes || 0} {item.likes === 1 ? "Like" : "Likes"}
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default App;