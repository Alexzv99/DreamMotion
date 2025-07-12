import Button from "@/components/Button";
import { Sparkles } from "lucide-react";

export default function Page() {
  const handleClick = () => alert("Clicked!");

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center bg-gray-100 p-6">
      <Button onClick={handleClick}>Primary Button</Button>

      <Button variant="secondary" onClick={handleClick}>
        Secondary Button
      </Button>

      <Button variant="gradient" onClick={handleClick} icon={<Sparkles />}>
        Gradient with Icon
      </Button>

      <Button loading>Loading State</Button>

      <Button disabled>Disabled</Button>
    </div>
  );
}
