export const DashboardPreview = () => {
    return (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 pointer-events-none scale-95 origin-center">
            {/* Somatotype Card Mock */}
            <div className="bg-white p-6 rounded-3xl col-span-1 h-64 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded-full" />
                    <div className="w-16 h-4 bg-gray-100 rounded-full" />
                </div>
            </div>
            {/* Chronotype Card Mock */}
            <div className="bg-primary/5 p-6 rounded-3xl col-span-1 h-64 border border-primary/10 flex flex-col justify-center items-center">
                <div className="w-32 h-32 rounded-full border-4 border-primary/20" />
            </div>
            {/* Offer Card Mock */}
            <div className="bg-gradient-to-br from-accent to-accent/80 p-6 rounded-3xl col-span-1 h-64 shadow-xl">
                <div className="w-full h-full bg-white/10 rounded-2xl" />
            </div>
            {/* Plan Details Mock */}
            <div className="bg-white p-6 rounded-3xl col-span-1 md:col-span-3 h-48 border border-gray-100 shadow-sm">
                <div className="flex gap-4 h-full">
                    <div className="w-1/3 h-full bg-gray-50 rounded-2xl" />
                    <div className="w-1/3 h-full bg-gray-50 rounded-2xl" />
                    <div className="w-1/3 h-full bg-gray-50 rounded-2xl" />
                </div>
            </div>
        </div>
    );
};
