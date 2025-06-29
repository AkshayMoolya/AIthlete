import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

interface AlertProps {
  type?: "error" | "success" | "info" | "warning";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ 
  type = "info", 
  title, 
  message, 
  onClose,
  className = ""
}: AlertProps) {
  const styles = {
    error: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: AlertCircle,
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: CheckCircle,
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-700",
      icon: Info,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: AlertCircle,
    },
  };

  const { container, icon: IconComponent } = styles[type];

  return (
    <div className={`border px-4 py-3 rounded flex items-start space-x-3 ${container} ${className}`}>
      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <p className={title ? "text-sm" : ""}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto pl-3"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
