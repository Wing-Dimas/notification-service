import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputText from "../../../components/input/InputText";
import LoadingIntro from "../components/LoadingIntro";
import { useForm } from "react-hook-form";
import { registerFormSchema, RegisterFormSchema } from "../form/register";
import { zodResolver } from "@hookform/resolvers/zod";
import useRegister from "../hooks/useRegister";
import { useAuthContext } from "../../../contexts/AuthContext";
import ErrorText from "../../../components/input/ErrorText";

const RegisterPage = () => {
  const { loading, register: onRegister } = useRegister();
  const { authUser } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
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
      reset({ username: "", email: "", password: "" });
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
            <h2 className="text-2xl font-semibold mb-2 text-center">Register</h2>
            <form onSubmit={handleSubmit((data) => onRegister(data))}>
              <div className="mb-4">
                <InputText containerStyle="mt-4" labelTitle="Username" {...register("username")} />
                {!!errors.username?.message && <ErrorText className="mt-2">{errors.username?.message}</ErrorText>}

                <InputText containerStyle="mt-4" labelTitle="Email" {...register("email")} />
                {!!errors.email?.message && <ErrorText className="mt-2">{errors.email?.message}</ErrorText>}

                <InputText type="password" containerStyle="mt-4" labelTitle="Password" {...register("password")} />
                {!!errors.password?.message && <ErrorText className="mt-2">{errors.password?.message}</ErrorText>}
              </div>

              {/* <ErrorText styleClass="mt-8">{errorMessage}</ErrorText> */}
              <button type="submit" className={`btn mt-2 w-full btn-primary`} disabled={loading}>
                Register
                {loading && <span className="loading loading-spinner loading-xs"></span>}
              </button>

              <div className="text-center mt-4">
                Already have an account?{" "}
                <Link to="/">
                  <span className="inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                    Login
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

export default RegisterPage;
