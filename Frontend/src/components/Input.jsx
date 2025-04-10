import React from "react";

function Input({ label, type, name,defaultValue, register, error, options, disabled }) {
  return (
    <div className="my-2 text-black">
      <h1 className="font-semibold ">{label}</h1>
      {type == "select" ? (
        <select
          {...register(name)}
          defaultValue={defaultValue}
          className="w-full inline-block bg-zinc-100 px-4 py-3 rounded-lg outline-none text-sm my-1"
        >
          {options.map((option) => {
            return (
              <option key={option} value={option.toLowerCase()} className="w-full">
                {option}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          {...register(name)}
          type={type || "text"}
          placeholder={label}
          className="w-full bg-zinc-100 px-4 py-3 rounded-lg outline-none text-sm my-1"
          disabled={disabled}
          defaultValue={defaultValue}
        />
      )}
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

export default Input;
