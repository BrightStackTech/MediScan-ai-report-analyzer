import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Camera, Mail, Phone, User, Loader2, Heart, CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingHealth, setIsSavingHealth] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Health Profile State
  const [dateOfBirth, setDateOfBirth] = useState(user?.healthProfile?.dateOfBirth || "");
  const [gender, setGender] = useState(user?.healthProfile?.gender || "");
  const [weight, setWeight] = useState(user?.healthProfile?.weight ? String(user.healthProfile.weight) : "");
  const [height, setHeight] = useState(user?.healthProfile?.height ? String(user.healthProfile.height) : "");

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setIsUploading(true);
    try {
      const res = await axios.put(`${API_URL}/users/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      updateUser({ profilePicture: res.data.profilePicture });
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const saveHealthProfile = async () => {
    if (!dateOfBirth || !gender || !weight || !height) {
      toast.error("Please fill all health profile fields");
      return;
    }

    setIsSavingHealth(true);
    try {
      const res = await axios.put(
        `${API_URL}/users/health-profile`,
        {
          dateOfBirth,
          gender,
          weight: parseFloat(weight),
          height: parseFloat(height),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateUser({ healthProfile: res.data.healthProfile });
      toast.success("Health profile saved successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save health profile");
    } finally {
      setIsSavingHealth(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeletingData(true);
    try {
      await axios.delete(`${API_URL}/users/delete-all-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("All your data has been deleted successfully");
      // Logout and redirect
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete data");
    } finally {
      setIsDeletingData(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="glass-morphism p-8 rounded-xl">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="relative group">
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-white/20 shadow-lg"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePfpUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="gap-2 border-white/10 hover:bg-white/5"
            >
              <Camera className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Change Photo"}
            </Button>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background/30 border border-white/5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-background/30 border border-white/5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-background/30 border border-white/5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Profile Card */}
        <div className="glass-morphism p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your Health Profile</h2>
              <p className="text-xs text-muted-foreground">
                Help us personalize your health insights by providing basic information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Date of Birth */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background/50 border-white/10 hover:bg-background/50 hover:border-primary"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(new Date(dateOfBirth), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDateOfBirth(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="other"
                    checked={gender === "other"}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Other</span>
                </label>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g., 70.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                className="bg-background/50 border-white/10 focus:border-primary"
              />
            </div>

            {/* Height */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g., 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                step="0.1"
                className="bg-background/50 border-white/10 focus:border-primary"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={saveHealthProfile}
              disabled={isSavingHealth}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 py-6 text-base mt-6"
            >
              {isSavingHealth ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-3">Why do we need this?</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Normal ranges vary by age (e.g., PSA, Testosterone, Vitamin D)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Many biomarkers differ between males and females (e.g., Hemoglobin, HDL)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>BMI can affect optimal ranges for glucose and triglycerides</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Your data is private and never shared</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Concern Section */}
        <div className="glass-morphism p-8 rounded-xl border border-red-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">Still Privacy Concern?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                If you're concerned about your data privacy, you can permanently delete your account and all associated data including your reports, health profile, and all records.
              </p>
              <p className="text-xs text-red-400/80 mb-4 font-medium">
                ⚠️ Warning: This action is permanent and cannot be undone. All your data will be permanently deleted.
              </p>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeletingData}
                variant="destructive"
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingData ? "Deleting..." : "Clear All Data"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete All Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground mt-4">
              <div className="space-y-3">
                <p className="font-medium text-foreground">You're about to permanently delete:</p>
                <ul className="space-y-2 text-sm ml-4">
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Your account ({user?.email})</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>All medical reports and analysis</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>Your health profile information</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <span>All login credentials (you'll be logged out)</span>
                  </li>
                </ul>
                <p className="font-medium text-red-500 mt-4">This action cannot be reversed.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel className="border-white/10 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              disabled={isDeletingData}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Everything"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
