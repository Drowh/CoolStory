import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabase";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useModalStore } from "../../stores/modalStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useToast from "../../hooks/useToast";
import { createUserProfile } from "../../services/profileService";

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
        const { error: registerError, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (registerError) throw new Error(registerError.message);

        if (data.user) {
          await createUserProfile();
        }

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

  const closeModal = useCallback(() => {
    setModalType(null);
  }, [setModalType]);

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
  }, [closeModal]);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={closeModal}
      role="button"
      aria-label="Закрыть окно аутентификации"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md relative shadow-lg border border-zinc-100 dark:border-gray-700 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label="Закрыть окно аутентификации"
        >
          <FontAwesomeIcon icon="times" size="lg" aria-hidden="true" />
        </button>

        <h2
          id="auth-dialog-title"
          className="text-2xl text-zinc-900 dark:text-gray-100 mb-6 font-medium"
        >
          {mode === "login" ? "Вход" : "Регистрация"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-4 mb-6">
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
              aria-label="Email"
              id="auth-email"
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
              aria-label="Пароль"
              id="auth-password"
            />
          </div>

          {generalError && (
            <p
              className="text-red-500 dark:text-red-400 text-sm mb-4"
              role="alert"
            >
              {generalError}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="gradient"
            size="md"
            className="w-full"
            aria-label={
              mode === "login" ? "Войти в аккаунт" : "Зарегистрировать аккаунт"
            }
            aria-disabled={loading}
          >
            {loading
              ? "Загрузка..."
              : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
          </Button>
        </form>

        <Button
          onClick={toggleMode}
          variant="ghost"
          size="md"
          className="w-full mt-4 text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={
            mode === "login"
              ? "Переключиться на регистрацию"
              : "Переключиться на вход"
          }
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </Button>
      </div>
    </div>
  );
}
