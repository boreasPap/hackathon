import WelcomeCard from "@/components/WelcomeCard";
import { CURRENT_USER } from "@/lib/current-user";

export default function DashboardWelcomePage() {
  return <WelcomeCard name={CURRENT_USER.name} />;
}
