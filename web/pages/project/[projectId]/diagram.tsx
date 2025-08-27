import { useRouter } from "next/router";
import DiagramView from "../../../components/DiagramView";

export default function DiagramPage() {
  const router = useRouter();
  const { projectId } = router.query;

  if (!projectId || typeof projectId !== "string") return <p>Loading...</p>;

  return <DiagramView projectId={projectId} />;
}
