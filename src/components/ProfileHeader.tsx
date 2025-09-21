import { UserResource } from "@clerk/types";
import CornerElements from "./CornerElements";

const ProfileHeader = ({ user }: { user: UserResource | null | undefined }) => {
  if (!user) return null;
  return (
    <div className="mb-10 relative bg-card/50 backdrop-blur-sm border border-border p-6 rounded-xl shadow-2xl">
      <CornerElements />

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          {user.imageUrl ? (
            <div className="relative w-24 h-24 overflow-hidden rounded-xl border border-border shadow-lg">
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-primary/20 flex items-center justify-center border border-border">
              <span className="text-3xl font-bold text-primary">
                {user.fullName?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-card"></div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-foreground">{user.fullName}</span>
            </h1>
            <div className="flex items-center bg-background/80 backdrop-blur-sm border border-green-500/50 rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <p className="text-xs font-mono text-green-400">USER ACTIVE</p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-primary via-primary/70 to-primary opacity-50 my-3"></div>
          <p className="text-muted-foreground font-mono">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;
