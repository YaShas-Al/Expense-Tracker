import React, { useContext, useState } from "react";
import AuthLayout from "../../components/Layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../utils/axiosInstance";
import defaultAvatar from "../../assets/default-avatar.jpg";

const SignUpForm = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Password validation logic
  const passwordRules = [
    { label: "Minimum 8 characters", valid: password.length >= 8 },
    { label: "At least 1 uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", valid: /[a-z]/.test(password) },
    { label: "At least 1 number", valid: /\d/.test(password) },
    { label: "At least 1 special character (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
  ];

  const isPasswordValid = passwordRules.every(rule => rule.valid);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName) return setError("Please enter your name");
    if (!validateEmail(email)) return setError("Please enter a valid email.");
    if (!isPasswordValid) return setError("Please meet all password requirements.");

    setError("");

    try {
      // start with default avatar
      let profileImageUrl = defaultAvatar;

      if (profilePic) {
         const imgUploadRes = await uploadImage(profilePic);
         profileImageUrl = imgUploadRes.imageUrl || defaultAvatar;
      }

      const payload = {
        fullName,
        email,
        password,
        profileImageUrl, // always sent (either uploaded URL or default)
      };

  

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Enter password"
                type="password"
              />

              {/* Password criteria display */}
              <ul className="mt-2 space-y-1 text-xs">
                {passwordRules.map((rule, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 ${
                      rule.valid ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {rule.valid ? "✔️" : "⚪"} {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary" disabled={!isPasswordValid}>
            SIGN UP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUpForm;
