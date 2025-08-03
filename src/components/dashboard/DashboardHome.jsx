import { useEffect, useState } from "react";
import { GetPublicFeed } from "../../apis/apicalls/apicalls";
import PublicFeed from "./dashboard-content/PublicFeed";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../loading-overlay/LoadingOverlay";
import { toast } from "react-toastify";


export default function DashboardHome() {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [feed, setFeed] = useState(null);

    useEffect(()=>{

        setIsLoading(true);
        const fetchData = async () => {

            try {
                const authToken = localStorage.getItem("token");

                if(authToken === null){
                    navigate("/user-login");
                    setIsLoading(false);
                    return;
                }

                const response = await GetPublicFeed(authToken, {pageNumber: null, pageSize: null, orderBy: null});

                if (response.status === 429) {
                    setIsLoading(false);
                    toast.warn(
                        "Too many requests are made, please relax yourself while using this application"
                    );
                    return;
                }
                
                if (response.status === 401) {
                    setIsLoading(false);
                    navigate("/user-login");
                    return;
                }

                const data = await response.json();

                setIsLoading(false);
                setFeed(data);

                const paginationDetails = response.headers.get("X-Pagination");
                console.log(paginationDetails);
            } catch (error) {
                setIsLoading(false);
                toast.error("Network error, please try again later");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden">
            
            {/* Subtle background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            {
                feed &&
                <PublicFeed apiData = {feed}/>
            }

        </div>
        {isLoading && (
            <LoadingOverlay
                isVisible={isLoading}
                message="Loading timelines"
                submessage="Please wait while we load timelines"
                variant="slate"
                size="medium"
                showDots={true}
            />
        )}
        </>
    );
}