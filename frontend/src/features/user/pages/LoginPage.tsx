import React, { useEffect } from "react";
import LoadingIntro from "../components/LoadingIntro";
import InputText from "../../../components/input/InputText";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { loginFormSchema, type LoginFormSchema } from "../form/login";
import { zodResolver } from "@hookform/resolvers/zod";
import useLogin from "../hooks/useLogin";
import ErrorText from "../../../components/input/ErrorText";
import { useAuthContext } from "../../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { loading, login } = useLogin();
  const { authUser } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (authUser) {
      navigate("/dashboard");
    }
  }, [authUser, navigate]);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ password: "" });
    }
  }, [formState, reset]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl  shadow-xl">
        <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
          <div className="">
            <LoadingIntro />
          </div>
          <div className="py-24 px-10">
            <h1 className="text-3xl text-center font-bold sm:hidden block">Notification Services</h1>
            <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>
            <form onSubmit={handleSubmit((data) => login(data))}>
              <div className="mb-4">
                <InputText
                  type="email"
                  //   updateType="emailId"
                  containerStyle="mt-4"
                  labelTitle="Email Id"
                  {...register("email")}
                />
                {!!errors.email?.message && <ErrorText className="mt-2">{errors.email?.message}</ErrorText>}

                <InputText
                  type="password"
                  //   updateType="password"
                  containerStyle="mt-4"
                  labelTitle="Password"
                  {...register("password")}
                />
                {!!errors.password?.message && <ErrorText className="mt-2">{errors.password?.message}</ErrorText>}
              </div>

              <div className="text-right text-primary">
                <Link to="/forgot-password">
                  <span className="text-sm  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                    Forgot Password?
                  </span>
                </Link>
              </div>

              <button type="submit" className={"btn mt-2 w-full btn-primary"} disabled={loading}>
                Login
                {loading && <span className="loading loading-spinner loading-xs"></span>}
              </button>

              <div className="text-center mt-4">
                Don't have an account yet?{" "}
                <Link to="/register">
                  <span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                    Register
                  </span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
