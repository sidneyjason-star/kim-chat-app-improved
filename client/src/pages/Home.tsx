import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, Send, Square, Settings, X } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const N8N_WEBHOOK_URL =
  "https://n8nwebhook.simonejlima.site/webhook/5a58817c-457f-4442-9b9b-3c16f19727b4";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userName, setUserName] = useState("");
  const [tempUserName, setTempUserName] = useState("");
  const [showUserNameDialog, setShowUserNameDialog] = useState(false);
  
  // Agent settings
  const [agentName, setAgentName] = useState("Agente");
  const [agentPhoto, setAgentPhoto] = useState("");
  const [tempAgentName, setTempAgentName] = useState("");
  const [tempAgentPhoto, setTempAgentPhoto] = useState("");
  const [showAgentSettingsDialog, setShowAgentSettingsDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user name and agent settings from localStorage on mount
  useEffect(() => {
    const savedUserName = localStorage.getItem("n8n_chat_userName");
    if (savedUserName) {
      setUserName(savedUserName);
    } else {
      setShowUserNameDialog(true);
    }

    const savedAgentName = localStorage.getItem("n8n_chat_agentName");
    if (savedAgentName) {
      setAgentName(savedAgentName);
    }

    const savedAgentPhoto = localStorage.getItem("n8n_chat_agentPhoto");
    if (savedAgentPhoto) {
      setAgentPhoto(savedAgentPhoto);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleSaveUserName = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName);
      localStorage.setItem("n8n_chat_userName", tempUserName);
      setShowUserNameDialog(false);
    }
  };

  const handleChangeUserName = () => {
    setTempUserName(userName);
    setShowUserNameDialog(true);
  };

  const handleOpenAgentSettings = () => {
    setTempAgentName(agentName);
    setTempAgentPhoto(agentPhoto);
    setShowAgentSettingsDialog(true);
  };

  const handleSaveAgentSettings = () => {
    if (tempAgentName.trim()) {
      setAgentName(tempAgentName);
      localStorage.setItem("n8n_chat_agentName", tempAgentName);
    }
    if (tempAgentPhoto) {
      setAgentPhoto(tempAgentPhoto);
      localStorage.setItem("n8n_chat_agentPhoto", tempAgentPhoto);
    }
    setShowAgentSettingsDialog(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAgentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (
    messageContent: string,
    isAudio: boolean = false
  ) => {
    if (!messageContent.trim() || !userName.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: isAudio ? "🎤 Áudio enviado" : messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send to n8n webhook with user name
      const payload = isAudio
        ? { audio: messageContent, nome: userName } // Base64 audio + user name
        : { message: messageContent, nome: userName }; // Text message + user name

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract message from response
      // Handle different response formats
      let responseMessageContent = "";

      // Handle array response format: [{output: "..."}]
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (firstItem.output && typeof firstItem.output === "string") {
          responseMessageContent = firstItem.output;
        } else if (firstItem.output && firstItem.output.mensagem) {
          responseMessageContent = firstItem.output.mensagem;
        } else if (firstItem.message) {
          responseMessageContent = firstItem.message;
        } else {
          responseMessageContent = JSON.stringify(firstItem);
        }
      } else if (data.output && data.output.mensagem) {
        // Format: { output: { mensagem: "..." } }
        responseMessageContent = data.output.mensagem;
      } else if (data.message) {
        responseMessageContent = data.message;
      } else if (data.response) {
        responseMessageContent = data.response;
      } else if (data.output && typeof data.output === "string") {
        // Format: { output: "..." }
        responseMessageContent = data.output;
      } else {
        responseMessageContent = JSON.stringify(data);
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: responseMessageContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Desculpe, ocorreu um erro ao conectar com o agente. Tente novamente.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          // Remove the data:audio/webm;base64, prefix
          const base64String = base64Audio.split(",")[1];
          sendMessage(base64String, true);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Não foi possível acessar o microfone. Verifique as permissões do navegador."
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          {agentPhoto && (
            <img
              src={agentPhoto}
              alt={agentName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">{agentName}</h1>
            <p className="text-sm opacity-90">
              {userName ? `Olá, ${userName}` : "Powered by LLM"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleOpenAgentSettings}
            className="text-white hover:bg-slate-800"
            title="Configurar agente"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleChangeUserName}
            className="text-white hover:bg-slate-800"
            title="Alterar nome"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* User Name Dialog */}
      {showUserNameDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 bg-slate-800 border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">
                Como você se chama?
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Seu nome será usado para personalizar as respostas do agente.
              </p>
            </div>
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSaveUserName();
                }
              }}
              autoFocus
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={handleSaveUserName}
              disabled={!tempUserName.trim()}
              className="w-full"
            >
              Continuar
            </Button>
          </Card>
        </div>
      )}

      {/* Agent Settings Dialog */}
      {showAgentSettingsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 bg-slate-800 border-slate-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Configurar Agente
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAgentSettingsDialog(false)}
                className="text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Agent Photo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Foto do Agente
              </label>
              {tempAgentPhoto && (
                <div className="relative">
                  <img
                    src={tempAgentPhoto}
                    alt="Agent"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1"
                    onClick={() => setTempAgentPhoto("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {tempAgentPhoto ? "Alterar Foto" : "Adicionar Foto"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Agent Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Nome do Agente
              </label>
              <Input
                type="text"
                placeholder="Digite o nome do agente"
                value={tempAgentName}
                onChange={(e) => setTempAgentName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              onClick={handleSaveAgentSettings}
              disabled={!tempAgentName.trim()}
              className="w-full"
            >
              Salvar
            </Button>
          </Card>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                Bem-vindo ao Chat {agentName}
              </p>
              <p className="text-sm">
                Envie uma mensagem ou grave um áudio para começar
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-xs md:max-w-md px-4 py-3 ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-3xl rounded-tr-none"
                  : "bg-slate-700 text-white rounded-3xl rounded-tl-none"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.type === "user"
                    ? "opacity-70"
                    : "text-slate-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-slate-700 text-white rounded-3xl rounded-tl-none px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Agente está respondendo...</p>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-background p-4 space-y-3">
        {isRecording && (
          <div className="flex items-center justify-between bg-red-950 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                Gravando... {formatTime(recordingTime)}
              </span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStopRecording}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Parar
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading && !isRecording) {
                handleSendText();
              }
            }}
            disabled={isLoading || isRecording}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
          />

          {!isRecording ? (
            <>
              <Button
                onClick={handleStartRecording}
                disabled={isLoading}
                variant="outline"
                size="icon"
                title="Gravar áudio"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Mic className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleSendText}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                title="Enviar mensagem"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : null}
        </div>

        <p className="text-xs text-slate-500 text-center">
          Pressione Enter para enviar ou use o botão de microfone para gravar
          áudio
        </p>
      </div>
    </div>
  );
}

