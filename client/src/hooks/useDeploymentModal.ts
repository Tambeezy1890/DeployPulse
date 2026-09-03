
import {  useState } from "react";
import type { User } from "../types/user";
import type { Project } from "../types/project";

type DeploymentModalState = {
    user: User | null;
    project: Project | null;
    show: boolean
}
type UseDeploymentModalArgs = {
    user: User
}
export function useDeploymentModal({user}: UseDeploymentModalArgs){
    const [deploymentModal,setDeploymentModal] = useState<DeploymentModalState>({
        user: null,
        project: null,
        show: false
    })
    function closeDeploymentModal(){
        setDeploymentModal({  
        user: null,
        project: null,
        show: false})
    }
    function openDeploymentModal(project: Project){
      setDeploymentModal({
        user,
        project,
        show: true
      })  
    }

    return{
        deploymentModal,
        closeDeploymentModal,
        openDeploymentModal,

        
    }
}