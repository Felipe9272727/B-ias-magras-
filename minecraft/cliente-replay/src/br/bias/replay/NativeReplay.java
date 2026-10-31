package br.bias.replay;

import net.minecraft.class_310;
import net.minecraft.class_742;

/** Native first-person rendering for the recording client only. */
public final class NativeReplay {
    public static final boolean ENABLED = Boolean.getBoolean("bias.replay.native");
    public static boolean drawingHands = false;
    private static long nextDiagnostic;
    public static void diagnose() {
        long now = System.currentTimeMillis();
        if (now < nextDiagnostic) return;
        nextDiagnostic = now + 10000;
        class_310 client = class_310.method_1551();
        System.out.println("[bias-native] enabled=" + ENABLED
            + " scene=" + System.getProperty("bias.replay.scene")
            + " camera=" + (client.method_1560() == null ? "null" : client.method_1560().getClass().getName())
            + " target=" + (target() == null ? "null" : target().method_7334().getName())
            + " perspective=" + client.field_1690.method_31044()
            + " hidden=" + client.field_1690.field_1842);
    }
    public static class_742 target() {
        class_310 client = class_310.method_1551();
        if (!ENABLED || client.field_1724 == null) return null;
        return client.method_1560() instanceof class_742 player && player != client.field_1724 ? player : null;
    }
}
