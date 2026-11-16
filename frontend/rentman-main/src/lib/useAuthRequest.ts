import {useSession} from "next-auth/react";
import {axios} from "@/lib/axiosInstance";

const useAuthRequest = () => {
    const { data: session } = useSession()
    if (session) {
        axios.defaults.headers.common.Authorization = `Bearer ${session.user.token}`;
    } else {
        axios.defaults.headers.common.Authorization = ''
    }
};

export default useAuthRequest;
