import { DialogsProvider } from "@/components/site/dialogs";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/sections/hero";
import { Problem } from "@/components/site/sections/problem";
import { HowItWorks } from "@/components/site/sections/how-it-works";
import { Games } from "@/components/site/sections/games";
import { AiTeam } from "@/components/site/sections/ai-team";
import { SkillTech } from "@/components/site/sections/skilltech";
import { StudentDashboard } from "@/components/site/sections/student-dashboard";
import { TeacherDashboard } from "@/components/site/sections/teacher-dashboard";
import { Schools } from "@/components/site/sections/schools";
import { Pricing } from "@/components/site/sections/pricing";
import { Gamification } from "@/components/site/sections/gamification";
import { Testimonials } from "@/components/site/sections/testimonials";
import { Faq } from "@/components/site/sections/faq";
import { FinalCta } from "@/components/site/sections/cta";
import { Footer } from "@/components/site/sections/footer";

export default function Home() {
  return (
    <DialogsProvider>
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="flex flex-1 flex-col">
        <Hero />
        <Problem />
        <HowItWorks />
        <Games />
        <AiTeam />
        <SkillTech />
        <StudentDashboard />
        <TeacherDashboard />
        <Schools />
        <Pricing />
        <Gamification />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </DialogsProvider>
  );
}
