import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateVerificationCode = () => {
  return Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
};
