import { authClient } from "@/config/authClient";
import { Card, CardBody, EmptyState, Loading } from "@/components";
import { MdPeople } from "react-icons/md";

export default function ClientsPage() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <Loading text="Verificando sesión..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-playfair text-text-darkest mb-1">Huéspedes</h1>
        <p className="text-text-muted font-lora">Gestión de clientes y huéspedes del hotel</p>
      </div>
      <Card>
        <CardBody>
          <EmptyState icon={<MdPeople className="w-10 h-10 text-text-muted/50" />} title="Sección en construcción" description="Esta funcionalidad estará disponible pronto" />
        </CardBody>
      </Card>
    </div>
  );
}
