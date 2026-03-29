import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ResultDisplayProps {
  summary: string;
}
const ResultDisplay = ({
  summary
}: ResultDisplayProps) => {
  return <Card className="w-full max-w-3xl mx-auto mt-8 animate-fade-up">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-md border p-4">
          <div className="space-y-4">
            {summary.split('\n').map((paragraph, index) => <p key={index} className="text-muted-foreground">
                {paragraph}
              </p>)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>;
};
export default ResultDisplay;