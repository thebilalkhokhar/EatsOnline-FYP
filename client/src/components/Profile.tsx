import {
  Loader2,
  LocateIcon,
  Mail,
  MapPin,
  MapPinnedIcon,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FormEvent, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/useUserStore";
import { Card, CardContent, CardHeader} from "./ui/card";

const Profile = () => {
  const { user, updateProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    profilePicture: user?.profilePicture || "",
  });

  const imageRef = useRef<HTMLInputElement | null>(null);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<string>(
    profileData.profilePicture || ""
  );

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedProfilePicture(result);
        setProfileData((prevData) => ({
          ...prevData,
          profilePicture: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const updateProfileHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await updateProfile(profileData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={updateProfileHandler}
      className="max-w-3xl mx-auto my-10 px-4"
    >
      <Card className="shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center gap-4">
          <div
            className="relative w-28 h-28 rounded-full group cursor-pointer"
            onClick={() => imageRef.current?.click()}
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={selectedProfilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Plus className="text-white w-6 h-6" />
            </div>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={fileChangeHandler}
            />
          </div>
          <Input
            type="text"
            name="fullname"
            value={profileData.fullname}
            onChange={changeHandler}
            placeholder="Full Name"
            className="text-center text-lg font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <Mail size={16} />
              Email
            </Label>
            <Input
              disabled
              name="email"
              value={profileData.email}
              onChange={changeHandler}
              className="bg-muted text-muted-foreground"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <LocateIcon size={16} />
              Address
            </Label>
            <Input
              name="address"
              value={profileData.address}
              onChange={changeHandler}
              placeholder="Your address"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MapPin size={16} />
              City
            </Label>
            <Input
              name="city"
              value={profileData.city}
              onChange={changeHandler}
              placeholder="Your city"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MapPinnedIcon size={16} />
              Country
            </Label>
            <Input
              name="country"
              value={profileData.country}
              onChange={changeHandler}
              placeholder="Your country"
            />
          </div>
        </CardContent>

        <div className="p-4 flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#ff5733] hover:bg-[#e14e2a] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Please wait
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default Profile;
