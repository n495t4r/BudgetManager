import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const FlashMessages = () => {
  const { flash, errors } = usePage().props;

  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success, {
        icon: <CheckCircle className="text-green-500" />,
      });
    }

    if (flash.error) {
      toast.error(flash.error, {
        icon: <XCircle className="text-red-500" />,
      });
    }

    if (flash.info) {
      toast(flash.info, {
        icon: <Info className="text-blue-500" />,
      });
    }

    if (flash.warning) {
      toast.warning(flash.warning, {
        icon: <AlertTriangle className="text-yellow-500" />,
      });
    }
  }, [flash]);

  return null; // Component just triggers side effects, no render
};

export default FlashMessages;
