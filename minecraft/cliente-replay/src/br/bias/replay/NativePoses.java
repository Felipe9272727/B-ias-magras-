package br.bias.replay;

import br.bias.replay.mixin.LimbAccess;
import com.google.gson.*;
import net.minecraft.*;
import java.nio.file.*;
import java.util.*;

/** Interpolates recorded poses at render frequency instead of network frequency. */
public final class NativePoses {
    private static final Path FILE = Path.of(System.getProperty("bias.replay.scene", "scene.native.json"));
    private static long stamp = -1, start = 0;
    private static double slow = 1;
    private static String mode = "";
    private static Map<String, double[][]> tracks = Map.of();
    private static long warned = 0;

    public static void apply(float delta) {
        if (!NativeReplay.ENABLED) return;
        class_310 client = class_310.method_1551();
        if (client.field_1687 == null) return;
        try {
            if (!Files.isRegularFile(FILE)) return;
            long modified = Files.getLastModifiedTime(FILE).toMillis();
            if (modified != stamp) {
                JsonObject data = JsonParser.parseString(Files.readString(FILE)).getAsJsonObject();
                Map<String,double[][]> next = new HashMap<>();
                for (var entry : data.getAsJsonObject("tracks").entrySet()) {
                    JsonArray points = entry.getValue().getAsJsonArray();
                    double[][] rows = new double[points.size()][7];
                    double distance = 0;
                    for (int i=0; i<rows.length; i++) {
                        JsonObject p = points.get(i).getAsJsonObject();
                        String[] keys = {"x","y","z","yaw","pitch"};
                        for (int j=0;j<5;j++) rows[i][j] = p.get(keys[j]).getAsDouble();
                        if(i>0) {
                            double dx=rows[i][0]-rows[i-1][0], dz=rows[i][2]-rows[i-1][2];
                            double d=Math.hypot(dx,dz);
                            if(d<6) distance+=d;
                            rows[i][6]=Math.min(1,d*4);
                        }
                        rows[i][5]=distance*4;
                    }
                    next.put(entry.getKey(),rows);
                }
                tracks=next;start=data.get("startMillis").getAsLong();slow=data.get("slow").getAsDouble();mode=data.get("mode").getAsString();stamp=modified;
            }
            class_5498 perspective = mode.equals("olhos") || mode.equals("fixa") ? class_5498.field_26664 : class_5498.field_26665;
            if(client.field_1690.method_31044()!=perspective) client.field_1690.method_31043(perspective);
            double index=start==0?0:Math.max(0,(System.currentTimeMillis()-start)/1000.0/slow/0.05);
            for (class_1657 entity:client.field_1687.method_18456()) {
                double[][] row=tracks.get(entity.method_7334().getName());
                if(row==null || row.length==0) continue;
                int i=Math.min(row.length-1,(int)index), j=Math.min(row.length-1,i+1);
                double[] a=row[i], b=row[j];double k=Math.min(1,index-i);
                if(Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2)+Math.pow(b[2]-a[2],2))>6) k=0;
                double x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k,z=a[2]+(b[2]-a[2])*k;
                double dy=Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]));
                float yaw=(float)(180-(a[3]+dy*k)*180/Math.PI), pitch=(float)(-(a[4]+(b[4]-a[4])*k)*180/Math.PI);
                entity.method_5814(x,y,z);
                entity.field_6014=entity.field_6038=x;entity.field_6036=entity.field_5971=y;entity.field_5969=entity.field_5989=z;
                entity.method_36456(yaw);entity.field_5982=yaw;entity.method_36457(pitch);entity.field_6004=pitch;
                entity.field_6241=entity.field_6259=yaw;
                float speed=(float)(a[6]+(b[6]-a[6])*k), phase=(float)(a[5]+(b[5]-a[5])*k);
                LimbAccess limb=(LimbAccess)(Object)entity.field_42108;
                limb.bias$previous(speed);limb.bias$speed(speed);limb.bias$position(phase+speed*(1-delta));
            }
        } catch (Exception e) {
            if(System.currentTimeMillis()-warned>1000){System.err.println("[bias-replay] pose file: "+e);warned=System.currentTimeMillis();}
        }
    }
}
