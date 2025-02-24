import React from "react";
import TemplatePointers from "./TemplatePointers";

const LoadingIntro: React.FC = () => {
  return (
    <div className="hero min-h-full rounded-l-xl bg-base-200">
      <div className="hero-content py-12">
        <div className="max-w-md md:block hidden">
          <h1 className="text-3xl text-center font-bold ">Notification Services</h1>

          <div className="text-center mt-12">
            <img src="./intro.png" alt="Dashwind Admin Template" className="w-48 inline-block"></img>
          </div>

          {/* Importing pointers component */}
          <TemplatePointers />
        </div>
      </div>
    </div>
  );
};

export default LoadingIntro;
