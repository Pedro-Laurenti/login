import { IoCheckmark, IoCheckmarkCircle, IoClose, IoCloseCircle, IoInformationCircle, IoWarning } from "react-icons/io5";

interface SimpleAlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

export default function SimpleAlert({ type, message, className = '' }: SimpleAlertProps) {
  const getAlertClass = () => {
    switch (type) {
      case 'error':
        return 'alert-error';
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <IoCloseCircle />;
      case 'success':
        return <IoCheckmarkCircle />;
      case 'warning':
        return <IoWarning />;
      case 'info':
        return <IoInformationCircle />;
      default:
        return <IoInformationCircle />;
    }
  };

  return (
    <div className={`alert ${getAlertClass()} ${className} mb-4`}>
      <span className="mr-2">{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
}
