import Link from "next/link";
import CornerElements from "./CornerElements";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";

const NoFitnessPlan = () => {
  return (
    <div className="relative bg-black/90 backdrop-blur-sm border border-red-500/30 rounded-xl p-12 text-center shadow-2xl">
      <CornerElements />

      <h2 className="text-3xl font-bold mb-6 font-mono">
        <span className="text-red-500">No</span> <span className="text-white">fitness plans yet</span>
      </h2>
      <p className="text-gray-300 mb-8 max-w-md mx-auto text-lg leading-relaxed">
        Start by creating a personalized fitness and diet plan tailored to your specific goals and
        needs
      </p>
      <Button
        size="lg"
        asChild
        className="relative overflow-hidden bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/25"
      >
        <Link href="/generate-program">
          <span className="relative flex items-center">
            Create Your First Plan
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </span>
        </Link>
      </Button>
    </div>
  );
};
export default NoFitnessPlan;
