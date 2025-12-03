export const Spinner = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    )
}
