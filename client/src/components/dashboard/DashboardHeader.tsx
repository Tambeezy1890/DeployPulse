import type { User } from "../../types/user";

type UserProps = {
    user: User
}

    function DashboardHeader({user}: UserProps){
        return (
            <div className="flex items-center justify-between px-8">
                <h1 className="text-3xl font-bold tracking-widest mb-6">DeployPulse</h1>
                <h1 className="font-bold text-slate-100 tracking-tight">{user.name}</h1>
            </div>
        )
    }

    export default DashboardHeader