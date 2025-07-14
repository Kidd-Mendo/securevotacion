import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Shield, 
  X, 
  Lock, 
  CheckCircle, 
  Download,
  User,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VotingModalProps {
  election: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function VotingModal({ election, isOpen, onClose }: VotingModalProps) {
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<any>(null);

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ["/api/elections", election?.id, "candidates"],
    enabled: !!election?.id && isOpen,
  });

  const voteMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const response = await apiRequest("POST", `/api/elections/${election.id}/vote`, {
        candidateId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVoteReceipt(data);
      setShowConfirmation(true);
      toast({
        title: "¡Voto emitido exitosamente!",
        description: "Su voto ha sido registrado de forma segura y anónima.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/elections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Iniciando sesión nuevamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error al emitir voto",
        description: error.message || "No se pudo registrar su voto. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar un candidato antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!isConfirmed) {
      toast({
        title: "Confirmación requerida",
        description: "Debe confirmar que ha revisado su selección.",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate(selectedCandidate);
  };

  const handleDownloadReceipt = () => {
    if (!voteReceipt) return;
    
    const receiptText = `
COMPROBANTE DE VOTO ELECTRÓNICO
================================

Elección: ${election.name}
Fecha: ${format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
ID de Transacción: ${voteReceipt.transactionId}
Estado: Cifrado y Verificado

Este comprobante confirma que su voto ha sido emitido exitosamente.
Para mayor información, conserve este documento.

Sistema de Votación Electrónica
Unidad Educativa Simulada
    `;
    
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-voto-${voteReceipt.transactionId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setSelectedCandidate("");
    setIsConfirmed(false);
    setShowConfirmation(false);
    setVoteReceipt(null);
    onClose();
  };

  if (candidatesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando candidatos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showConfirmation && voteReceipt) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary-foreground text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">¡Voto Emitido Exitosamente!</h3>
            <p className="text-muted-foreground mb-6">Su voto ha sido registrado de forma segura y anónima.</p>
            
            {/* Vote Receipt */}
            <Card className="bg-muted mb-6 text-left">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">Comprobante de Voto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elección:</span>
                    <span className="font-medium">{election.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">
                      {format(new Date(voteReceipt.timestamp), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID de Transacción:</span>
                    <span className="font-mono text-xs">{voteReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="text-secondary font-medium">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Cifrado y Verificado
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Emisión de Voto</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Elección: {election.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Security Indicator */}
          <div className="vote-confirmation">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Conexión cifrada y voto anónimo garantizado
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Voting Form */}
        <div className="space-y-6">
          {/* Candidate Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Seleccione su candidato preferido:
            </label>
            <div className="space-y-3">
              {candidates?.map((candidate: any) => (
                <Card
                  key={candidate.id}
                  className={`candidate-card ${selectedCandidate === candidate.id ? "selected" : ""}`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <CardContent className="p-0">
                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate.id}
                        checked={selectedCandidate === candidate.id}
                        onChange={() => setSelectedCandidate(candidate.id)}
                        className="sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary peer-checked:ring-2 peer-checked:ring-primary/20 flex items-center justify-center">
                        {selectedCandidate === candidate.id && (
                          <div className="w-2 h-2 bg-card rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={candidate.photoUrl} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{candidate.name}</p>
                            {candidate.party && (
                              <p className="text-sm text-muted-foreground">{candidate.party}</p>
                            )}
                            {candidate.proposal && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                Propuesta: {candidate.proposal}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Vote Confirmation */}
          <Card className="vote-confirmation">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="vote-confirmation"
                  checked={isConfirmed}
                  onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="vote-confirmation" className="text-sm text-foreground cursor-pointer">
                  Confirmo que he revisado mi selección y deseo emitir mi voto. 
                  Entiendo que esta acción es <strong>irreversible</strong>.
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Warning for single vote elections */}
          {!election.allowMultipleVotes && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Importante:</p>
                <p>Esta elección permite un solo voto. Una vez confirmado, no podrá modificar su selección.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={voteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || !isConfirmed || voteMutation.isPending}
              className="flex-1"
            >
              {voteMutation.isPending ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Emitir Voto Seguro
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
