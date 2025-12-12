export default function Spinner() {
  return (
    <div className="w-full flex justify-center items-center py-8">
      <div className="flex space-x-2">
        <div className="h-3 w-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
