import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useModalStore } from "../../stores/modalStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useToast from "../../hooks/useToast";

interface AuthFormProps {
  initialMode?: "login" | "register";
}

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [generalError, setGeneralError] = useState<string>("");
  const { setModalType } = useModalStore();
  const toast = useToast();

  const translateError = (errorMessage: string): string => {
    if (errorMessage.includes("email")) return "Неверный формат email";
    if (errorMessage.includes("password"))
      return "Пароль должен быть не менее 6 символов";
    if (errorMessage.includes("Database error saving new user"))
      return "Ошибка базы данных при сохранении пользователя";
    if (errorMessage.includes("Invalid login credentials"))
      return "Неверный email или пароль";
    if (errorMessage.includes("User already registered"))
      return "Пользователь с таким email уже зарегистрирован";
    return "Произошла ошибка: " + errorMessage;
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError("Пароль должен быть не менее 6 символов");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setGeneralError("");

    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw new Error(loginError.message);
        toast.success("Вход выполнен успешно!");
        setModalType(null);
        window.location.reload();
      } else {
        const { error: registerError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (registerError) throw new Error(registerError.message);
        toast.success("Регистрация успешна! Подтвердите email.");
        setModalType(null);
      }
    } catch (error: unknown) {
      const translatedError = translateError(
        error instanceof Error ? error.message : String(error)
      );
      toast.error(translatedError);
      if (translatedError.includes("email")) setEmailError(translatedError);
      else if (translatedError.includes("пароль"))
        setPasswordError(translatedError);
      else setGeneralError(translatedError);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        className="bg-gray-800 rounded-lg p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <FontAwesomeIcon icon="times" size="lg" />
        </button>

        <h2 className="text-2xl text-gray-200 mb-6">
          {mode === "login" ? "Вход" : "Регистрация"}
        </h2>

        <div className="space-y-6 mb-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>

        {generalError && (
          <p className="text-red-500 text-sm mb-4">{generalError}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="gradient"
          size="md"
          className="w-full"
        >
          {loading
            ? "Загрузка..."
            : mode === "login"
            ? "Войти"
            : "Зарегистрироваться"}
        </Button>

        <Button
          onClick={toggleMode}
          variant="ghost"
          size="md"
          className="w-full mt-4"
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </Button>
      </div>
    </div>
  );
}
