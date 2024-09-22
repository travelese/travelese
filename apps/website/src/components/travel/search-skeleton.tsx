import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchSkeleton() {
  return (
    <Card>
      <div className="flex w-full items-center justify-between p-6 rounded-lg">
        <div className="w-2/3 space-y-4 pr-5 border-r border-dashed">
          <div>
            <Skeleton className="w-24 h-6" />
            <div className="flex items-center space-x-2">
              <Skeleton className="w-12 h-10" />
              <div className="flex-1 border-t" />
              <Skeleton className="w-12 h-12 rounded-full m-2" />
              <div className="flex-1 border-t" />
              <Skeleton className="w-12 h-10" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-32 h-8 rounded-md" />
              <Skeleton className="w-24 h-6" />
              <Skeleton className="w-32 h-8 rounded-md" />
            </div>
          </div>
          <div>
            <Skeleton className="w-24 h-6" />
            <div className="flex items-center space-x-2">
              <Skeleton className="w-12 h-10" />
              <div className="flex-1 border-t" />
              <Skeleton className="w-12 h-12 rounded-full m-2" />
              <div className="flex-1 border-t" />
              <Skeleton className="w-12 h-10" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-32 h-8 rounded-md" />
              <Skeleton className="w-24 h-6" />
              <Skeleton className="w-32 h-8 rounded-md" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-4">
            <Skeleton className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-1/3">
          <Skeleton className="w-32 h-20 mt-2 rounded-md" />
          <Skeleton className="h-6 w-48 mt-2" />
          <Skeleton className="w-32 h-10 mt-2 rounded-md" />
          <Skeleton className="w-44 h-10 mt-2 rounded-md" />
          <Skeleton className="w-32 h-10 mt-2 rounded-md" />
        </div>
      </div>
    </Card>
  );
}
