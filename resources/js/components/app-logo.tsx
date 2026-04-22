export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <img src="/logo.png" alt="Logo" className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate leading-tight font-bold">
                    Ardana
                </span>
                <span className="text-xs">Financial System</span>
            </div>
        </>
    );
}
