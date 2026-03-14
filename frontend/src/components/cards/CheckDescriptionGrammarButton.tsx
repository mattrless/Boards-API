import { SpellCheck } from "lucide-react";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "sonner";
import { useAiControllerCheckGrammar } from "@/lib/api/generated/ai/ai";

type CheckDescriptionGrammarButtonProps = {
  description: string;
  onCheckDescriptionGrammar?: (description: string) => void;
  disabled?: boolean;
};

export default function CheckDescriptionGrammarButton({
  description,
  onCheckDescriptionGrammar,
  disabled = false,
}: CheckDescriptionGrammarButtonProps) {
  const aiCheckGrammarMutation = useAiControllerCheckGrammar();

  function handleCheckGrammarDescription() {
    aiCheckGrammarMutation.mutate(
      { data: { description } },
      {
        onSuccess: (response) => {
          if (response.status === 400) {
            toast.error("Description is needed");
          }
          if (response.status !== 200) {
            return;
          }
          toast.success("Description fixed.");
          onCheckDescriptionGrammar?.(response.data.description);
        },
        onError: () => {
          toast.error("Something went wrong.");
        },
      },
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="group relative inline-flex rounded-md p-px">
          <div className="absolute inset-0 rounded-md bg-[linear-gradient(90deg,#22d3ee,#38bdf8,#60a5fa,#34d399,#22d3ee)] bg-size-[200%_200%] bg-position-[0%_50%] transition-[background-position] duration-700 group-hover:bg-position-[100%_50%]" />
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Fix grammar in description"
              disabled={disabled || aiCheckGrammarMutation.isPending}
              onClick={handleCheckGrammarDescription}
              className="relative z-10 rounded-[calc(var(--radius)-1px)] bg-background/80 text-foreground hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <SpellCheck className="size-4" />
              <span>Grammar</span>
            </Button>
          </TooltipTrigger>
        </div>
        <TooltipContent side="top">Fix grammar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
