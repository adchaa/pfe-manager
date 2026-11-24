import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";

interface SprintEmptyStateProps {
  onCreate: () => void;
  showCreateButton?: boolean;
}

export function SprintEmptyState({ onCreate, showCreateButton = true }: SprintEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">No sprints in this project yet</p>
        {showCreateButton && (
          <Button variant="outline" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create first sprint
          </Button>
        )}
      </CardContent>
    </Card>
  );
}