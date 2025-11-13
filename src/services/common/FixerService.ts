import { User } from "../../models/user.model";
import { EnableFixerInput } from "../../types/EnableFixerInput";

export class FixerService {
  async enableFixer(data: EnableFixerInput) {
    const { userId, experiences, phone, ...fixerData } = data;

    const experiencesWithId = experiences.map((exp, i) => ({
      ...exp,
      id: `exp-${Date.now()}-${i}`,
    }));

    const updateData: any = {
      role: 'fixer',
      'fixerProfile': {
        ...fixerData,
        experiences: experiencesWithId,
      },
    };

    // Solo actualiza phone si se envía
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    const result = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!result) throw new Error('Usuario no encontrado');

    return { message: 'Fixer habilitado exitosamente', userId: result._id };
  }
}