import { redirect } from "next/navigation";
import { ScriptGenerator } from "@/components/script-generator";

export default function GeneratePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Demo Script</h1>
      <p className="text-muted-foreground mb-8">Generate a customized demo script in minutes using our AI-powered templates</p>
      
      <ScriptGenerator />
    </div>
  );
}
